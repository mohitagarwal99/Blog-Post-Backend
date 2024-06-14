import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";


const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save(
            {validateBeforeSave: false}
        );

        return {accessToken, refreshToken}
    } catch (error) {
        new ApiError(500, "Error while generating tokens");
    }
}

const options = {
    httpOnly: true,
    secure: true
};

const registerUser = asyncHandler(async (req, res) => {
    const {username, email, fullname, password} = req.body;
    console.log(req.body);
    if (
        [username, email, fullname, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({$or: [{username}, {email}]});
    if(existedUser){
        throw new ApiError(400, "User already exists");
    }
    

    const user = await User.create({
        username,
        email,
        fullname,
        password,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "Error while creating user");
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            createdUser,
            "User created successfully"
        )
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const {email, username, password} = req.body;
    if(!email && !username){
        throw new ApiError(400, "Email or username is required");
    }

    const user = await User.findOne({$or: [{email}, {username}]});

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordMatch(password);

    if( !isPasswordCorrect){
        throw new ApiError(401, "Password Incorrect");
    }

    const {accessToken, refreshToken} = await generateTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                loggedInUser,
                accessToken,
                refreshToken,
            },
            "User logged in successfully"
        )
    );

});

const logoutUser = asyncHandler( async (req, res) => {
    console.log(req.user);
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {refreshToken: undefined}
        },
        {
            new: true
        }
    );

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            {},
            "User logged out successfully"
        )
    );


});

const refreshAccessToken = asyncHandler(async (req, res) => {
    
    const inputRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!inputRefreshToken){
        throw new ApiError(401, "Unauthorized request");
    }

    try {

        const decodedToken = jwt.verify(inputRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);
 
        if( !user ){
            throw new ApiError(401, "Unauthorized request");
        }
    
        if ( inputRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is either expired or used");
        }
    
        const options = {
            httpOnly: true,
            secure: true,
    
        }
    
        const {accessToken, refreshToken} = await generateTokens(user._id);
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken
                },
                "Acess token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};

