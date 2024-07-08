import {asyncHandler} from "../utils/asyncHandler.js"

// Steps for user registration :-
// get user details from frontend(postman)
// validation - not empty
// check if user already exists : email and username
// check for images, check for avatar(required)
// upload to cloudinary, check if avatar uploaded or not
// create user object - create entry in db
// remove password and refresh token field from response
// check for user creation, return response or error
const registerUser = asyncHandler(async(req,res) =>{
    const {fullName, email, username, password} = req.body
    console.log("email ", email);
})

export {registerUser}