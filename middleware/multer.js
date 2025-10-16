
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads';

// Ensure the directory exists. This will create it if it doesn't.
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true }); // recursive: true is safer for nested paths
    console.log(`'${uploadDir}' directory created.`);
  } catch (err) {
    console.error(`Error creating upload directory '${uploadDir}':`, err);
    
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // The destination function is called by Multer for each file.
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using timestamp and original extension
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional: Limit file size (e.g., 5MB)
  fileFilter: (req, file, cb) => { // Optional: Filter file types
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png, gif) are allowed!'));
    }
  }
});

export default upload;