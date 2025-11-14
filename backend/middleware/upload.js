const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ---------------------------------------------------------
// CREATE UPLOADS FOLDER IF NOT EXISTS
// ---------------------------------------------------------
const uploadsDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 'uploads' folder created.");
}

// ---------------------------------------------------------
// STORAGE ENGINE
// ---------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `proof-${unique}${ext}`);
  },
});

// ---------------------------------------------------------
// FILE FILTER (ONLY IMAGES ALLOWED)
// ---------------------------------------------------------
const fileFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|gif|webp/;

  const extValid = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowed.test(file.mimetype);

  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, GIF, WEBP images allowed!"), false);
  }
};

// ---------------------------------------------------------
// MULTER CONTROL
// ---------------------------------------------------------
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB
  },
});

// ---------------------------------------------------------
// ERROR HANDLER (GLOBAL FOR MULTER)
// ---------------------------------------------------------
const handleUploadError = (err, req, res, next) => {
  console.log("⚠ Multer Error: ", err.message);

  // Multer file size error
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Image too large. Maximum allowed size is 8MB.",
      });
    }
  }

  // Custom errors (invalid file type, etc.)
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error",
    });
  }

  next();
};

module.exports = { upload, handleUploadError };
