import { Router } from "express";
import {verifyJWT, optionalVerifyJWT} from '../middlewares/auth.middleware.js';
import {
  registeruser,
  refreshAccessToken,
  loginuser,
  logoutuser,
  changeCurrentPassword,
  deleteUser,
  getUsername,
  updateDetails,
  getUserProfile,
  verifyEmail,
  updateTheme,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserPublicProfile,
  searchUsers,
  removeFollower,
  forgotPassword,
} from "../controller/user.controller.js";

const router = Router();
router.route('/register').post(registeruser);
router.route('/verify-email').get(verifyEmail);
router.route('/refreshtoken').get(refreshAccessToken);
router.route('/login').post(loginuser);
router.route('/forgotpassword').post(forgotPassword);
router.route('/logout').post(verifyJWT, logoutuser);
router.route('/changepassword').post(verifyJWT, changeCurrentPassword);
router.route('/deleteuser').post(verifyJWT, deleteUser);
router.route('/getusername').get(verifyJWT, getUsername);
router.route('/updatedetails').post(verifyJWT, updateDetails);
router.route('/getuserprofile').get(verifyJWT, getUserProfile);
router.route('/updatetheme').post(verifyJWT, updateTheme);
router.route('/follow').post(verifyJWT, followUser);
router.route('/unfollow').post(verifyJWT, unfollowUser);
router.route('/remove-follower').post(verifyJWT, removeFollower);
router.route('/followers').get(verifyJWT, getFollowers);
router.route('/following').get(verifyJWT, getFollowing);
router.route('/search').get(searchUsers);
router.route('/public-profile/:username').get(getUserPublicProfile);
router.get("/me", optionalVerifyJWT, (req, res) => {
  if (!req.user) {
    return res.status(200).json({
      loggedIn: false,
      user: null,
    });
  }

  res.status(200).json({
    loggedIn: true,
    user: {
      username: req.user.username,
      email: req.user.email,
    },
  });
});
export default router;