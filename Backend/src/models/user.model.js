import mongoose,{Schema} from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import crypto from "crypto";
dotenv.config({
    path:"./.env"
});
import jwt from "jsonwebtoken";

const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        minlength:3,
        index: true,
        lowercase:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        minlength:3,
        lowercase:true,
        trim:true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email"]
    },
    password:{
        type: String,
        required:true,
        minlength:8
    },
    fullname:{
        type : String,
        required:true,
        minlength:3,
        index:true,
        trim:true
    },
    address:{
        type:String,
        required:true,
        minlength:3
    },
    refreshToken:{
        type:String
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
        index: true,
    },
    emailVerificationToken: {
        type: String,
    },
    emailVerificationTokenExpiry: {
        type: Date,
    }
},{timestamps:true});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.generateEmailVerificationToken = function () {
    const rawToken = crypto.randomBytes(32).toString("hex");
    this.emailVerificationToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
    this.emailVerificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24);
    return rawToken;
};

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);
 }
 
 userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
         {
         _id:this._id, 
         username:this.username,
         email:this.email
         },
         process.env.ACCESS_TOKEN_SECRET ,
         {
             expiresIn: process.env.ACCESS_TOKEN_EXPIRY
         }
     )
 }
 
 userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
         {
         _id:this._id,
         },
         process.env.REFRESH_TOKEN_SECRET ,
         {
             expiresIn: process.env.REFRESH_TOKEN_EXPIRY
         }
     )
 }

export const User=mongoose.model('User', userSchema );