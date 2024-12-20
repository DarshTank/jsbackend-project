import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // 1. get user details from frontend
  // 2. validation - not empty
  // 3. check if user already exist: username, email
  // 4. check for images, check for avatar
  // 5. upload them to cloudinary, avatar
  // 6. create user object - cretae entry in db
  // 7. remove password and refresh token field from response
  // 8. check for user creation
  // 9. return res

  const { fullName, email, username, password } = req.body;
  // console.log("Email: ", email);
  console.log("Sucessfully sent the data to the DataBase");

  // if (fullName == "") {
  //   throw new ApiError(400, "Fullname is Required");
  // }

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields are Required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  // console.log(existedUser);

  if (existedUser) {
    throw new ApiError(409, "User alredy Exist!");
  }
  // console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.lenght > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is Required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar Image is Required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering User");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Sucessfully!"));
});

const loginUser = asyncHandler(async (req, res) => {
  // 1.req body -> Data
  // 2. username or email
  // 3. find the user
  // 4.password check
  // 5.access and refresh token
  // 6.send cookies

  const { email, username, password } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "Username or Email Required");
  }

  const user = await User.findOne({
    $or: [username, email],
  });

  if (!user) {
    throw new ApiError(404, "User doesnot Exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {});

export { registerUser, loginUser };
