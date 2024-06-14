
import mongoose, {Schema} from "mongoose";

const postSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        media:{
            type: String,
            required: true,
        },
        createdBy:{
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    }, {timestamps: true});

export const Post = mongoose.model("Post", postSchema);