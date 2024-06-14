import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secrte: process.env.CLOUDINARY_API_SCRET
});

const uploadOnCloud = async (localFilePath) => {
    try {
        if(!localFilePath)
            return null;
    
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_Type: "auto"
        }
        );
    
        console.log("File uploaded successfully, url: ", uploadResult.url);
        fs.unlinkSync(localFilePath);
        return uploadResult;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }

}

export default uploadOnCloud;