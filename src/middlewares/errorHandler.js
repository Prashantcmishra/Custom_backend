import multer from "multer";

/**
 * Global Express error handler — must be the LAST middleware registered.
 * Catches multer errors, validation errors, and unhandled exceptions.
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(`[ERROR] ${err.message}`);

  // Multer-specific errors (file size, wrong type, etc.)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "File too large. Maximum size is 5MB."
          : err.message,
    });
  }

  // Custom thrown errors from fileFilter
  if (err.message?.includes("Only JPEG")) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Generic server error
  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
};

export default errorHandler;