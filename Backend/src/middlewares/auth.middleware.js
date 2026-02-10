import {ApiError} from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config({
    path: "/.env"
});
export const verifyJWT=asyncHandler(async(req,_,next)=>{
    try{
        const token =req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
         if(!token){throw new ApiError(401,"unauthorized");}
        const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedtoken?._id).select("-password -refreshToken")
        if(!user){throw new ApiError(401,"Invaild Access Token");}
        req.user=user;
        next();
    }catch(err){
    throw new ApiError(401,`invalid access token!!!!! generated in file middlewares/aith.middelware.js ${err.message}`);
    }
});
export const optionalVerifyJWT = async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return next();

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decoded._id).select("username email");
    if (user) req.user = user;
  } catch {
    
  }
  next();
};