import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import jwt from "jsonwebtoken";
import {ApiResponse} from '../utils/ApiResponse.js';
import crypto from "crypto";
import { sendVerificationMail, sendPasswordResetMail, hasSmtpConfig } from "../utils/mail.service.js";
import { getCache, setCache, deleteCache } from "../utils/redis.js";

const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};


const registeruser = asyncHandler(async (req, res) => {
    const { username, email, password, fullname, address } = req.body;

    if (!fullname?.trim()) throw new ApiError(400, "Fullname is required");
    if (!password) throw new ApiError(400, "Password is required");
    if (!email?.trim()) throw new ApiError(400, "Email is required");
    if (!username?.trim()) throw new ApiError(400, "Username is required");
    if (!address?.trim()) throw new ApiError(400, "Address is required");

    const normalizedUsername = username.toLowerCase().trim();
    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({
        $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (user && user.isEmailVerified) {
        throw new ApiError(409, "User or email already exists");
    }

    if (!user) {
        user = await User.create({
            username: normalizedUsername,
            email: normalizedEmail,
            password,
            fullname: fullname.trim(),
            address: address.trim(),
            isEmailVerified: false,
        });
    } else {
        user.username = normalizedUsername;
        user.email = normalizedEmail;
        user.password = password;
        user.fullname = fullname.trim();
        user.address = address.trim();
        user.isEmailVerified = false;
    }

    const rawToken = user.generateEmailVerificationToken();
    await user.save();

    const clientUrl =
        process.env.FRONTEND_URL || "http://localhost:5173";
    const verificationUrl = `${clientUrl}/verify-email?token=${rawToken}&id=${user._id}`;

    let mailSent = false;
    let mailError = null;
    try {
        await sendVerificationMail({
            to: user.email,
            username: user.username,
            verificationUrl,
        });
        mailSent = true;
    } catch (error) {
        mailError = error;
        console.error("Verification email send failed", {
            message: error?.message,
            code: error?.code,
            command: error?.command,
            responseCode: error?.responseCode,
            response: error?.response,
        });
    }

    if (!mailSent && process.env.NODE_ENV === "production") {
        throw new ApiError(
            502,
            "Could not send verification email. Please try again in a minute."
        );
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                email: user.email,
                verificationUrl:
                    mailSent && hasSmtpConfig ? undefined : verificationUrl,
                mailError:
                    process.env.NODE_ENV === "production"
                        ? undefined
                        : mailError?.message,
            },
            mailSent
                ? "Registration successful. Please verify your email to activate your account, and check your spam folder if you don't see the email."
                : "Registration successful, but email could not be sent. Use the verification link shown below."
        )
    );
});

const generateAccessTokenAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
   } catch(error){
        throw new ApiError(500,`Token generation failed while generating access token and refresh token:${error.message}`);
   }
};

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request");
   }
    try {
        const decodedToken=jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user=await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError(401,"User not found by refresh token");
       }
        if(incomingRefreshToken !==user?.refreshToken){
            throw new ApiError(400,"Refresh token does not match -> Invalid refresh token");
       }
        const {accessToken, newRefreshToken}=await generateAccessTokenAndRefreshToken(user._id);
        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(
                new ApiResponse(200,{
                    accessToken,
                    refreshToken: newRefreshToken
               },"Access token updated")
            );
   } catch(error){
        throw new ApiError(400, `Invalid refresh token: ${error.message}`);
   }
});

const loginuser=asyncHandler(async(req,res)=>{
    const {email,username,password}=req.body;

    if(!email && !username){
        throw new ApiError(400,"Email or username is required");
   }

    const user=await User.findOne({
        $or:[{email},{username}]
   });

    if(!user){
        throw new ApiError(404,"User not found");
   }

    if(!user.isEmailVerified){
        throw new ApiError(403,"Email not verified. Please verify your account first.");
    }

    const isPasswordRight=await user.isPasswordCorrect(password);
    if(!isPasswordRight){
        throw new ApiError(401,"Password is incorrect");
   }

    const{accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id);
    const loggedUser=await User.findById(user._id).select("-password -refreshToken");
    
    return res
        .status(200)
        .cookie("accessToken",accessToken,cookieOptions)
        .cookie("refreshToken",refreshToken,cookieOptions)
        .json(
            new ApiResponse(200,{
                user:loggedUser,
                accessToken,
                refreshToken
           },"User logged in successfully")
        );
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { token, id } = req.query;

    if (!token || !id) {
        throw new ApiError(400, "Invalid verification link");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        _id: id,
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
        throw new ApiError(400, "Verification link is invalid or expired");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Email verified successfully"));
});

const logoutuser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset:{
        refreshToken: 1,
     },
   },
    {
      new:true,
   }
  );

  return res
    .status(200)
    .clearCookie("accessToken",cookieOptions)
    .clearCookie("refreshToken",cookieOptions)
    .json(new ApiResponse(200,{},"User logged out successfully"));
});

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const{oldPassword,newPassword,confirmPassword}=req.body;
    if(newPassword !==confirmPassword){
        throw new ApiError(401,"New password and confirm password are different");
   }
    const user=await User.findById(req.user?._id);
    if(user?.username?.toLowerCase() === "avasanam"){
        throw new ApiError(403,"Password changes are disabled for this user.");
   }
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(401,"Wrong old password");
   }
    user.password=newPassword;
    await user.save({validateBeforeSave:false});
    return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Password changed successfully")
        );
});

const updateDetails=asyncHandler(async(req,res)=>{
    const {username,email,fullname,address}=req.body;
    if(!username && !email && !fullname && !address){
        throw new ApiError(400,"At least one field is required to update");
   }
   const user1=await User.findById(req.user?._id);
   if(user1?.username?.toLowerCase() === "avasanam"){
        throw new ApiError(403,"This feature is disabled for this user.");
   }
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                username,
                email,
                fullname,
                address
           }
       },
        {new:true}
    ).select("-password -refreshToken");

    await deleteCache(`user:profile:${req.user?._id}`);

    return res
        .status(200)
        .json(
            new ApiResponse(200,user,"Details updated successfully")
        );
});

const deleteUser=asyncHandler(async(req,res)=>{
    const user=await User.findByIdAndDelete(req.user?._id);
    if(!user){
        throw new ApiError(404,"User not found");
   }
    if (user.username?.toLowerCase() === "avasanam") {
        throw new ApiError(403, "Account deletion is disabled for this user.");
    }
    await User.findByIdAndDelete(user._id);
    await deleteCache(`user:profile:${req.user?._id}`);
    return res
        .status(200)
        .json(
            new ApiResponse(200, user,"User deleted successfully")
        );
});

const getUsername=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user?._id).select("username");
    return res
        .status(200)
        .json(
            new ApiResponse(200,user,"Username fetched successfully")
        );
}); 

const getUserProfile=asyncHandler(async(req,res)=>{
    const cacheKey = `user:profile:${req.user?._id}`;
    const cachedUser = await getCache(cacheKey);
    if (cachedUser) {
        return res
            .status(200)
            .json(new ApiResponse(200, cachedUser, "User profile fetched successfully (from Redis cache)"));
    }

    const user=await User.findById(req.user?._id).select("-password -refreshToken");
    if(!user){
        throw new ApiError(404,"User not found");
    }

    await setCache(cacheKey, user, 1800); // 30 minutes TTL

    return res
        .status(200)
        .json(
            new ApiResponse(200,user,"User profile fetched successfully")
        );
});

const updateTheme=asyncHandler(async(req,res)=>{
    const {theme}=req.body;
    if(!theme || !theme.trim()){
        throw new ApiError(400,"Theme is required");
   }
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                theme: theme.trim()
           }
       },
        {new:true}
    ).select("-password -refreshToken");

    await deleteCache(`user:profile:${req.user?._id}`);

    return res
        .status(200)
        .json(
            new ApiResponse(200,user,"Theme updated successfully")
        );
});

const sendFriendRequest = asyncHandler(async (req, res) => {
    const { targetUserId } = req.body;
    const currentUserId = req.user?._id;

    if (!targetUserId) {
        throw new ApiError(400, "Target user ID is required");
    }
    if (targetUserId === currentUserId.toString()) {
        throw new ApiError(400, "You cannot send a friend request to yourself");
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
        throw new ApiError(404, "User not found");
    }

    const currentUser = await User.findById(currentUserId);

    if (currentUser.friends?.includes(targetUserId)) {
        throw new ApiError(400, "You are already friends with this user");
    }

    if (currentUser.friendRequestsSent?.includes(targetUserId)) {
        throw new ApiError(400, "Friend request already sent");
    }

    if (currentUser.friendRequestsReceived?.includes(targetUserId)) {
        currentUser.friendRequestsReceived = currentUser.friendRequestsReceived.filter(
            (id) => id.toString() !== targetUserId
        );
        targetUser.friendRequestsSent = targetUser.friendRequestsSent.filter(
            (id) => id.toString() !== currentUserId.toString()
        );

        if (!currentUser.friends.includes(targetUserId)) currentUser.friends.push(targetUserId);
        if (!targetUser.friends.includes(currentUserId)) targetUser.friends.push(currentUserId);

        await currentUser.save();
        await targetUser.save();

        return res.status(200).json(new ApiResponse(200, {}, "Friend request accepted!"));
    }

    if (!currentUser.friendRequestsSent.includes(targetUserId)) {
        currentUser.friendRequestsSent.push(targetUserId);
    }
    if (!targetUser.friendRequestsReceived.includes(currentUserId)) {
        targetUser.friendRequestsReceived.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json(new ApiResponse(200, {}, "Friend request sent successfully"));
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
    const { senderId } = req.body;
    const currentUserId = req.user?._id;

    if (!senderId) {
        throw new ApiError(400, "Sender user ID is required");
    }

    const senderUser = await User.findById(senderId);
    if (!senderUser) {
        throw new ApiError(404, "User not found");
    }

    const currentUser = await User.findById(currentUserId);

    currentUser.friendRequestsReceived = (currentUser.friendRequestsReceived || []).filter(
        (id) => id.toString() !== senderId
    );
    senderUser.friendRequestsSent = (senderUser.friendRequestsSent || []).filter(
        (id) => id.toString() !== currentUserId.toString()
    );

    if (!currentUser.friends) currentUser.friends = [];
    if (!senderUser.friends) senderUser.friends = [];

    if (!currentUser.friends.some((id) => id.toString() === senderId)) {
        currentUser.friends.push(senderId);
    }
    if (!senderUser.friends.some((id) => id.toString() === currentUserId.toString())) {
        senderUser.friends.push(currentUserId);
    }

    await currentUser.save();
    await senderUser.save();

    return res.status(200).json(new ApiResponse(200, {}, "Friend request accepted"));
});

const rejectFriendRequest = asyncHandler(async (req, res) => {
    const { senderId } = req.body;
    const currentUserId = req.user?._id;

    if (!senderId) {
        throw new ApiError(400, "Sender user ID is required");
    }

    const currentUser = await User.findById(currentUserId);
    const senderUser = await User.findById(senderId);

    currentUser.friendRequestsReceived = (currentUser.friendRequestsReceived || []).filter(
        (id) => id.toString() !== senderId
    );
    if (senderUser) {
        senderUser.friendRequestsSent = (senderUser.friendRequestsSent || []).filter(
            (id) => id.toString() !== currentUserId.toString()
        );
        await senderUser.save();
    }
    await currentUser.save();

    return res.status(200).json(new ApiResponse(200, {}, "Friend request rejected"));
});

const cancelFriendRequest = asyncHandler(async (req, res) => {
    const { targetUserId } = req.body;
    const currentUserId = req.user?._id;

    if (!targetUserId) {
        throw new ApiError(400, "Target user ID is required");
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    currentUser.friendRequestsSent = (currentUser.friendRequestsSent || []).filter(
        (id) => id.toString() !== targetUserId
    );
    if (targetUser) {
        targetUser.friendRequestsReceived = (targetUser.friendRequestsReceived || []).filter(
            (id) => id.toString() !== currentUserId.toString()
        );
        await targetUser.save();
    }
    await currentUser.save();

    return res.status(200).json(new ApiResponse(200, {}, "Friend request canceled"));
});

const getFriendRequests = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id)
        .populate('friendRequestsReceived', 'username fullname')
        .populate('friendRequestsSent', 'username fullname');

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                received: user.friendRequestsReceived || [],
                sent: user.friendRequestsSent || [],
            },
            "Friend requests fetched successfully"
        )
    );
});

const followUser = sendFriendRequest;

const unfollowUser = asyncHandler(async (req, res) => {
    const { userIdToUnfollow, friendId } = req.body;
    const targetId = userIdToUnfollow || friendId;
    if (!targetId) {
        throw new ApiError(400, "User ID is required");
    }

    const userToUnfollow = await User.findById(targetId);
    const currentUser = await User.findById(req.user?._id);

    if (currentUser) {
        currentUser.friends = (currentUser.friends || []).filter(id => id.toString() !== targetId);
        currentUser.following = (currentUser.following || []).filter(id => id.toString() !== targetId);
        currentUser.followers = (currentUser.followers || []).filter(id => id.toString() !== targetId);
        await currentUser.save();
    }

    if (userToUnfollow) {
        userToUnfollow.friends = (userToUnfollow.friends || []).filter(id => id.toString() !== req.user?._id.toString());
        userToUnfollow.following = (userToUnfollow.following || []).filter(id => id.toString() !== req.user?._id.toString());
        userToUnfollow.followers = (userToUnfollow.followers || []).filter(id => id.toString() !== req.user?._id.toString());
        await userToUnfollow.save();
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Friend removed successfully")
    );
});

const getFriends = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id)
        .populate('friends', 'username fullname')
        .populate('following', 'username fullname')
        .populate('followers', 'username fullname');
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const friendMap = new Map();
    [...(user.friends || []), ...(user.following || []), ...(user.followers || [])].forEach(f => {
        if (f && f._id && f._id.toString() !== user._id.toString()) {
            friendMap.set(f._id.toString(), f);
        }
    });
    const friends = Array.from(friendMap.values());
    return res
        .status(200)
        .json(
            new ApiResponse(200, friends, "Friends fetched successfully")
        );
});

const getFollowers = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id).populate('followers', 'username fullname').select('followers');
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, user.followers, "Followers fetched successfully")
        );
});

const getFollowing = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id).populate('following', 'username fullname').select('following');
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, user.following, "Following fetched successfully")
        );
});

const getUserPublicProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username || !username.trim()) {
        throw new ApiError(400, "Username is required");
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() })
        .select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry")
        .populate('followers', 'username fullname')
        .populate('following', 'username fullname')
        .populate('friends', 'username fullname');

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User profile fetched successfully")
        );
});

const searchUsers = asyncHandler(async (req, res) => {
    const { query } = req.query;
    if (!query || !query.trim()) {
        throw new ApiError(400, "Search query is required");
    }

    const searchQuery = query.trim();
    const isIdQuery = /^[0-9a-fA-F]{24}$/.test(searchQuery);
    const searchConditions = [{ username: { $regex: searchQuery, $options: 'i' } }];
    if (isIdQuery) {
        searchConditions.push({ _id: searchQuery });
    }

    const rawUsers = await User.find({ $or: searchConditions })
        .select('_id username fullname')
        .limit(10);

    let resultUsers = rawUsers.map(u => u.toObject());

    if (req.user?._id) {
        const currentUser = await User.findById(req.user._id);
        if (currentUser) {
            const friendSet = new Set([
                ...(currentUser.friends || []).map(id => id.toString()),
                ...(currentUser.following || []).map(id => id.toString())
            ]);
            const sentSet = new Set((currentUser.friendRequestsSent || []).map(id => id.toString()));
            const receivedSet = new Set((currentUser.friendRequestsReceived || []).map(id => id.toString()));

            resultUsers = resultUsers.map(u => {
                const uid = u._id.toString();
                return {
                    ...u,
                    isFriend: friendSet.has(uid),
                    isRequested: sentSet.has(uid),
                    hasIncomingRequest: receivedSet.has(uid)
                };
            });
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, resultUsers, "Users found successfully")
        );
});

const removeFollower = asyncHandler(async (req, res) => {
    const { userIdToRemove } = req.body;
    if (!userIdToRemove) {
        throw new ApiError(400, "User ID is required");
    }

    const followerToRemove = await User.findById(userIdToRemove);
    if (!followerToRemove) {
        throw new ApiError(404, "User not found");
    }

    const currentUser = await User.findById(req.user?._id);
    currentUser.followers = currentUser.followers.filter(id => id.toString() !== userIdToRemove);
    await currentUser.save();

    followerToRemove.following = followerToRemove.following.filter(id => id.toString() !== req.user?._id.toString());
    await followerToRemove.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Follower removed successfully")
        );
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email, username } = req.body;

    if (!email && !username) {
        throw new ApiError(400, "Email or username is required");
    }
    const user = await User.findOne({
        $or: [{ email: email?.toLowerCase().trim() }, { username: username?.toLowerCase().trim() }]
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const temporaryPassword = crypto.randomBytes(8).toString('hex');
    user.password = temporaryPassword;
    await user.save({ validateBeforeSave: false });
    let mailSent = false;
    let mailError = null;

    try {
        await sendPasswordResetMail({
            to: user.email,
            username: user.username,
            newPassword: temporaryPassword,
        });
        mailSent = true;
    } catch (error) {
        mailError = error;
        console.error("Password reset email send failed", {
            message: error?.message,
            code: error?.code,
            command: error?.command,
            responseCode: error?.responseCode,
            response: error?.response,
        });
    }

    if (!mailSent && process.env.NODE_ENV === "production") {
        throw new ApiError(502, "Could not send password reset email. Please try again in a minute.");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { email: user.email },
            mailSent
                ? "Password reset successfully. A new temporary password has been sent to your email. Please check your email and spam folder."
                : "Password reset successful, but email could not be sent due to email service unavailability. Your temporary password has been generated."
        )
    );
});

export {
    registeruser, refreshAccessToken,
    loginuser, logoutuser, changeCurrentPassword,
    deleteUser, getUsername, updateDetails, getUserProfile, verifyEmail, updateTheme,
    followUser, unfollowUser, getFollowers, getFollowing, getFriends, getUserPublicProfile, searchUsers, removeFollower, forgotPassword,
    sendFriendRequest, acceptFriendRequest, rejectFriendRequest, cancelFriendRequest, getFriendRequests
};
