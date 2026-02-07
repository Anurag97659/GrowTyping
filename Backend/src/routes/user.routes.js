import { Router } from "express";
import {verifyJWT} from '../middlewares/auth.middleware.js';
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
export default router;