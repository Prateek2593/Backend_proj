import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'

const userSchema = new Schema(
    {
        username : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true
        },
        email : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true
        },
        fullName : {
            type : String,
            required : true,
            index : true,
            trim : true,
        },
        avatar : {
            type : String, //cloudinary url
            required : true
        },
        coverImage : {
            type : String,
        },
        watchHistory : [
            {
                type : Schema.Types.ObjectId,
                ref : "Video"
            }
        ],
        password : {
            type : String,
            required : [true, "Password is required"]
        },
        refreshToken : {
            type : String
        }
    }, {timestamps : true}
);

//pre is a middleware which will be executed before anything
//it take an event (say, save) and a call back function
//dont use arrow function, as it doesnot have 'this' reference
userSchema.pre("save", async function(next){
    console.log(this.password);
    //is password not modified, then go to next()
    if(!this.isModified("password")) return next();
    //encryption of password
    this.password = await bcrypt.hash(this.password, 10);
    console.log(this.password);
    next()
})

//method to check whether the entered password is correct or not
//compare method takes two arguments, one the password which user will enter and other is the password which is saved in db
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password) // returns boolean value
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id : this._id,
        email : this.email,
        username : this.username,
        fullname : this.fullname
    }, 
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id : this._id,
    }, 
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}

export const User = mongoose.model("User", userSchema)