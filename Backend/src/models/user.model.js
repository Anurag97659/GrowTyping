import mongoose,{Schema} from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config({
    path:"/.env"
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
        trim:true
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
    phone:{
        type:Number,
        required:true,
        minlength:10,
        maxlength:10
    },
    address:{
        type:String,
        required:true,
        minlength:3
    },
    cart: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    orders:[{ type: Schema.Types.ObjectId, ref: "Product" }],
    refreshToken:{
        type:String
    }
},{timestamps:true});

userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password= await bcrypt.hashSync(this.password,10);
        return next();
    }
    else return next();
})

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