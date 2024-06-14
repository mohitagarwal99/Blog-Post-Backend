import {Router} from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { createPost, retrievePosts, retrievePostById, updatePost, deletePost } from "../controllers/posts.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const postRouter = Router();

postRouter.route("/new-post").post(upload.fields([
    {
        name: "media",
        maxCount: 1
    }
]), verifyToken, createPost);

postRouter.route("/retrieve-all-posts").get(retrievePosts);

postRouter.route("/retrieve-post/:id").get(retrievePostById);

postRouter.route("/update-post/:id").put(verifyToken, updatePost);

postRouter.route("/delete-post/:id").delete(verifyToken, deletePost);


export default postRouter;