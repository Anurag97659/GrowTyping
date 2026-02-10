import { Router } from "express";
import {verifyJWT, optionalVerifyJWT} from '../middlewares/auth.middleware.js';
import { registeruser,refreshAccessToken,
    loginuser,logoutuser, changeCurrentPassword,
    deleteUser,getUsername, updateDetails, getUserProfile
 } from "../controller/user.controller.js";  

const router = Router();
router.route('/register').post(registeruser);
router.route('/refreshtoken').get(refreshAccessToken);
router.route('/login').post(loginuser);
router.route('/logout').post(verifyJWT, logoutuser);
router.route('/changepassword').post(verifyJWT, changeCurrentPassword);
router.route('/deleteuser').post(verifyJWT, deleteUser);
router.route('/getusername').get(verifyJWT, getUsername);
router.route('/updatedetails').post(verifyJWT, updateDetails);
router.route('/getuserprofile').get(verifyJWT, getUserProfile);
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