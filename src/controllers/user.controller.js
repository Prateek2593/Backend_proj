import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async(userId)=>{
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    //refresh token saving in db
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave : false})

    return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refress token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  // Steps for user registration :-
  // get user details from frontend(postman)
  // validation - not empty
  // check if user already exists : email and username
  // check for images, check for avatar(required)
  // upload to cloudinary, check if avatar uploaded or not
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation, return response or error

  // get user details from frontend(postman)
  const { fullName, email, username, password } = req.body;
  //console.log("email ", email);

  // if (fullName === "") {
  //     throw new ApiError(400, "Fullname is required")
  // }
  // validation - not empty
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user already exists : email and username
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // check for images, check for avatar(required)
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // upload to cloudinary, check if avatar uploaded or not
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  // check for user creation, remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registration");
  }

  // return response or error
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully!!"));
});

const loginUser = asyncHandler(async(req,res) =>{
   // Steps for user login:-
   // req body -> data
   // username or email
   // find the user
   // password check
   // access and refresh token
   // send cookie

  const {email, username, password} = req.body
  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required")
  }
  
  //find the user based on either username or email
  const user = await User.findOne({
    $or : [{username}, {email}]
  })

  if(!user){
    throw new ApiError(404, "User does not exist!!")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)
  if(!isPasswordValid){
    throw new ApiError(401, "Invalid User credentials")
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  //cookie
  const options = {
    httpOnly : true,
    secure : true
  }

  return res
  .status(200)
  .cookie("accessToken",accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {
      user : loggedInUser, accessToken, refreshToken
      }, 
      "User Logged In Successfully")
  )
})

const logoutUser = await asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,{
      $set : {
        refreshToken : undefined
      }
    },
    {
      new : true
    }
  )

  //cookie
  const options = {
    httpOnly : true,
    secure : true
  }
  
  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200,{}, "User Logged Out!!"))
})

export { registerUser, loginUser, logoutUser };
