// cloudinaryService.js
import cloudinary from './cloudinaryConfig.js';
import fs from 'fs';

/**
 * Uploads a file to Cloudinary and removes the local copy.
 * @param {string} localFilePath - The absolute path to the local file.
 * @returns {Object|null} - Returns the Cloudinary response object or null on failure.
 */
export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" // Automatically detects if it is an image, video, or raw file
        });

        // Upload successful: delete the temporary local file
        fs.unlinkSync(localFilePath);
        
        return response; // Contains response.url, response.public_id, etc.

    } catch (error) {
        // If the upload fails, ensure we still delete the corrupted/un-uploaded local file
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.error("Cloudinary Upload Error:", error);
        return null;
    }
}