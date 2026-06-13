// cloudinaryService.js
import cloudinary from '../config/cloudinaryConfig.js'

export const uploadOnCloudinary = async (fileBuffer) => {
    // Because streams are callback-based, we wrap it in a Promise so you can still use 'await' in your controller
    return new Promise((resolve, reject) => {
        if (!fileBuffer) return resolve(null);

        // CRITICAL FIX: Use upload_stream instead of upload
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "shopnest" }, 
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Stream Error:", error);
                    return resolve(null);
                }
                // Success! Return the Cloudinary URL object
                resolve(result);
            }
        );

        // This actually fires the buffer data to Cloudinary
        uploadStream.end(fileBuffer);
    });
};