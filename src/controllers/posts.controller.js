import { Post } from "../models/post.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {uploadOnCloud, deleteOnCloud} from "../utils/cloudinary.js"

const createPost = asyncHandler( async (req, res) => {
    const {title, content} = req.body;

    if ([title, content].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }

    const mediaPath = req.files?.media[0]?.path;
    console.log(mediaPath)

    if (!mediaPath){
        throw new ApiError(400, "Media is required");
    }

    const media = await uploadOnCloud(mediaPath);

    if (!media){
        throw new ApiError(400, "Error while uploading media");
    }

    const post = await Post.create({
        title,
        content,
        media: media.url,
        createdBy: req.user._id
    })

    const createdPost = await Post.findById(post._id).select();

    if (!createdPost){
        throw new ApiError(500, "Error while creating post");
    }
    
    //isko check kro new sath m pass krke otherwise post k array ka count bhi
    const user = await User.findByIdAndUpdate(req.user._id, { $push: { posts: createdPost._id } },
    { new: true }
    );

    // agr update krne k baad nhi bdh rha to isko delete krdo post se bhi
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            createdPost,
            "Post created successfully"
        )
    );

} )

const retrievePosts = asyncHandler( async (req, res) => {
    const posts = await Post.find().populate("createdBy", "username email").select();
    if (!posts){
        throw new ApiError(500, "Error while retrieving posts");
    }

    if (posts.length === 0){
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                posts,
                "No posts available"
            )
        );
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            posts,
            "Posts retrieved successfully"
        )
    );
})

const retrievePostById = asyncHandler( async (req, res) => {
    const post = await Post.findById(req.params.id).populate("createdBy", "username email").select();
    if (!post){
        throw new ApiError(404, "Post not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            post,
            "Post retrieved successfully"
        )
    );
})

const updatePost = asyncHandler( async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post){
        throw new ApiError(404, "Post not found");
    }

    if (post.createdBy.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to update this post");
    }

    const {title, content} = req.body;
    console.log(title, content)
    if (!title && !content){
        throw new ApiError(400, "Atleast one field is required to update");
    }

    const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        {
            $set: {
                title,
                content
            }
        },
        {new: true}
        );

    if (!updatedPost){
        throw new ApiError(500, "Error in updating post");
    }

    return res
    .status(200)
    .json(
        200,
        updatedPost,
        "Post updated successfully"
    )
})

const deletePost = asyncHandler( async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    if (post.createdBy.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not allowed to delete this post");
    }


    const deletedMedia = await deleteOnCloud(post.media);
    if (!deletedMedia){
        throw new ApiError(500, "Error while deleting media on cloudinary");
    }

    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost){
        throw new ApiError(500, "Error while deleting post");
    }

    await User.findByIdAndUpdate(
        req.user._id, 
        { 
            $pull: { posts: req.params.id } 
        }
    );

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            deletedPost,
            "Post deleted successfully"
        )
    );
})

export { createPost,
    retrievePosts,
    retrievePostById,
    updatePost,
    deletePost
 };