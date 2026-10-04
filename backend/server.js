const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const { sendContactEmail } = require("./controllers/emailController");
const contactRoutes = require("./routes/contactRoutes");

// Load env FIRST
dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Local Connected"))
  .catch((err) => console.log(err));

// Connect DB
connectDB();

const app = express();

// Create necessary directories
const directories = ["tmp", "uploads", "uploads/profiles", "uploads/resumes"];
directories.forEach((dir) => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created ${dir} directory`);
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// IMPORTANT: Apply express-fileupload ONLY to routes that need it
// Instead of global app.use, we'll use it conditionally

// Create a custom middleware to conditionally apply fileUpload
const conditionalFileUpload = (req, res, next) => {
  // Skip file upload processing for routes that use multer
  const skipPaths = ['/api/projects', '/api/formations', '/api/certificates'];

  const shouldSkip = skipPaths.some((p) => req.path.startsWith(p));

  if (shouldSkip) {
    console.log(
      `Skipping express-fileupload for ${req.path} - using multer instead`,
    );
    return next();
  }

  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"),
    limits: { fileSize: 10 * 1024 * 1024 },
    abortOnLimit: true,
    createParentPath: true,
    debug: false,
  })(req, res, next);
};

// Apply the conditional middleware
app.use(conditionalFileUpload);

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  if (req.files) {
    console.log("Files received (express-fileupload):", Object.keys(req.files));
  }
  next();
});

// CORS
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/projects", require("./routes/projectRoutes")); // This will use multer
app.use("/api/formations", require("./routes/formationRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));
app.use("/api/contact", contactRoutes);

// Contact Route
app.post("/api/contact/send", sendContactEmail);

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
  });
});

// Home
app.get("/", (req, res) => {
  res.json({
    message: "Portfolio API is running...",
    version: "1.0.0",
  });
});

// Health
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
  });
});

// Error middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`📧 Contact endpoint: http://localhost:${PORT}/api/contact/send`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, "uploads")}`);
});

// Handle crashes
process.on("unhandledRejection", (err) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = { app, server };
