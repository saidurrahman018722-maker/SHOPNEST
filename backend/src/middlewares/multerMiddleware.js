
// import multer from "multer";
// import fs from "fs";

// // Ensure the temp directory exists
// const tempDir = "./public/temp";
// if (!fs.existsSync(tempDir)) {
//     fs.mkdirSync(tempDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         // This is where files will be saved temporarily
//         cb(null, tempDir);
//     },
//     filename: function (req, file, cb) {
//         // Give the file a unique name to prevent overwriting
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
//     }
// });

// export const upload = multer({ 
//     storage,
//     // Optional: Limit file size (e.g., 50MB for videos)
//     limits: { fileSize: 50 * 1024 * 1024 } 
import multer from "multer";

// Use memory storage to hold the file in RAM as a Buffer
const storage = multer.memoryStorage();

// Security check: Only allow specific file types into RAM
const fileFilter = (req, file, cb) => {
  // Check the mimetype (allows all images and videos)
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    // Reject the file if it's not a supported type
    cb(new Error("Unsupported file format. Only images and videos are allowed."), false);
  }
};

export const upload = multer({ 
  storage,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter
});