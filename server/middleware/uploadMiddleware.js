import multer from 'multer';

// Configure multer storage settings to use in-memory storage (for S3 upload)
const storage = multer.memoryStorage();

// Define file filter to only allow image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Only image files are allowed!'), false); // Reject the file
  }
};

// Set up multer with defined storage and file filter
const upload = multer({ storage, fileFilter });

export default upload;
