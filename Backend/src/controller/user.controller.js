import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import jwt from "jsonwebtoken";
import {ApiResponse} from '../utils/ApiResponse.js';
import dotenv from "dotenv";
dotenv.config({
    path: "/.env"
});

const registeruser = asyncHandler(async (req, res) => {
    const { username, email, password, fullname, address } = req.body;

    if (!fullname?.trim()) throw new ApiError(400, "Fullname is required");
    if (!password) throw new ApiError(400, "Password is required");
    if (!email?.trim()) throw new ApiError(400, "Email is required");
    if (!username?.trim()) throw new ApiError(400, "Username is required");
    if (!address?.trim()) throw new ApiError(400, "Address is required");

    const normalizedUsername = username.toLowerCase().trim();
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
        $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingUser) {
        throw new ApiError(409, "User or email already exists");
    }

    const user = await User.create({
        username: normalizedUsername,
        email: normalizedEmail,
        password,
        fullname: fullname.trim(),
        address: address.trim(),
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "User creation failed due to some internal problem");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "User created successfully"));
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
        const options={
            httpOnly: true,
            secure: true
       };
        const {accessToken, newRefreshToken}=await generateAccessTokenAndRefreshToken(user._id);
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
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

    const isPasswordRight=await user.isPasswordCorrect(password);
    if(!isPasswordRight){
        throw new ApiError(401,"Password is incorrect");
   }

    const{accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id);
    const loggedUser=await User.findById(user._id).select("-password -refreshToken");
    
    const options={
        httpOnly:true,
        secure:true
   };
    return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(200,{
                user:loggedUser,
                accessToken,
                refreshToken
           },"User logged in successfully")
        );
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

  const options={
    httpOnly:true,
    secure:true,
 };
  return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out successfully"));
});

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const{oldPassword,newPassword,confirmPassword}=req.body;
    if(newPassword !==confirmPassword){
        throw new ApiError(401,"New password and confirm password are different");
   }
    const user=await User.findById(req.user?._id);
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
    ).select("-password");
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


export {registeruser, refreshAccessToken,
     loginuser, logoutuser, changeCurrentPassword, 
     deleteUser, getUsername, updateDetails
    };