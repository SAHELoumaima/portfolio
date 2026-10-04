const asyncHandler = require("express-async-handler");
const Profile = require("../models/Profile");
const path = require("path");
const fs = require("fs");

const getProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id });

  if (profile) {
    res.json(profile);
  } else {
    // Return empty profile structure if not found
    res.json({
      user: req.user._id,
      name: "",
      email: "",
      phone: "",
      certification: "",
      description: "",
      jobTitle: "",
      location: "",
      bio: "",
      profileImage: "",
      resume: "",
      contactLinks: {
        email: "",
        github: "",
        linkedin: "",
        discord: "",
        twitter: "",
        other: {},
      },
    });
  }
});

const updateProfile = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    certification,
    description,
    jobTitle,
    location,
    bio,
    contactLinks,
    skills, // Add this line
  } = req.body;

  let profile = await Profile.findOne({ user: req.user._id });

  if (profile) {
    // Update existing profile
    profile.name = name || profile.name;
    profile.email = email || profile.email;
    profile.phone = phone !== undefined ? phone : profile.phone;
    profile.certification =
      certification !== undefined ? certification : profile.certification;
    profile.description =
      description !== undefined ? description : profile.description;
    profile.jobTitle = jobTitle !== undefined ? jobTitle : profile.jobTitle;
    profile.location = location !== undefined ? location : profile.location;
    profile.bio = bio !== undefined ? bio : profile.bio;
    profile.contactLinks = contactLinks || profile.contactLinks;
    profile.skills = skills !== undefined ? skills : profile.skills; // Add this line

    const updatedProfile = await profile.save();
    res.json(updatedProfile);
  } else {
    // Create new profile
    profile = await Profile.create({
      user: req.user._id,
      name,
      email,
      phone: phone || "",
      certification: certification || "",
      description: description || "",
      jobTitle: jobTitle || "",
      location: location || "",
      bio: bio || "",
      skills: skills || [], // Add this line
      contactLinks: contactLinks || {
        email: "",
        github: "",
        linkedin: "",
        discord: "",
        twitter: "",
        other: {},
      },
    });
    res.status(201).json(profile);
  }
});

const uploadProfileImage = asyncHandler(async (req, res) => {
  console.log("=== UPLOAD IMAGE DEBUG ===");
  console.log("req.files:", req.files);
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("==========================");

  if (!req.files || !req.files.image) {
    console.log("No image file found");
    res.status(400);
    throw new Error("Please upload an image file");
  }

  const file = req.files.image;

  // Guard: make sure it's an express-fileupload instance (has .mv method)
  if (typeof file.mv !== "function") {
    console.error("File object is not an express-fileupload instance:", file);
    res.status(500);
    throw new Error(
      "File upload middleware not applied correctly. Expected express-fileupload.",
    );
  }

  console.log("Image file:", file.name, file.size, file.mimetype);

  // Check file type
  if (!file.mimetype.startsWith("image")) {
    res.status(400);
    throw new Error("Please upload an image file");
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    res.status(400);
    throw new Error("Image size should be less than 5MB");
  }

  // Create unique filename
  const fileName = `profile-${req.user._id}-${Date.now()}${path.extname(file.name)}`;
  const uploadPath = path.join(
    __dirname,
    "..",
    "uploads",
    "profiles",
    fileName,
  );

  // Create uploads/profiles directory if it doesn't exist
  const dir = path.join(__dirname, "..", "uploads", "profiles");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    // Move file to upload directory
    await file.mv(uploadPath);
    console.log("Image saved to:", uploadPath);
  } catch (error) {
    console.error("Error moving file:", error);
    res.status(500);
    throw new Error("Failed to upload image: " + error.message);
  }

  // Update profile with image URL
  const imageUrl = `/uploads/profiles/${fileName}`;

  let profile = await Profile.findOne({ user: req.user._id });

  if (profile) {
    // Delete old image if exists
    if (profile.profileImage) {
      const oldImagePath = path.join(__dirname, "..", profile.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log("Old image deleted:", oldImagePath);
      }
    }

    profile.profileImage = imageUrl;
    await profile.save();
  } else {
    // Create profile with image
    profile = await Profile.create({
      user: req.user._id,
      name: req.user.name || "",
      email: req.user.email || "",
      profileImage: imageUrl,
    });
  }

  res.json({
    success: true,
    imageUrl: imageUrl,
    message: "Profile image uploaded successfully",
  });
});

const uploadResume = asyncHandler(async (req, res) => {
  console.log("=== UPLOAD RESUME DEBUG ===");
  console.log("req.files:", req.files);
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("===========================");

  if (!req.files || !req.files.resume) {
    console.log("No resume file found in req.files");
    res.status(400);
    throw new Error("Please upload a resume file");
  }

  const file = req.files.resume;

  // Guard: make sure it's an express-fileupload object (has .mv method)
  if (typeof file.mv !== "function") {
    console.error("File object is not an express-fileupload instance:", file);
    res.status(500);
    throw new Error(
      "File upload middleware not applied correctly. Expected express-fileupload.",
    );
  }

  console.log("Resume file:", file.name, file.size, file.mimetype);

  // Check file type
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedTypes.includes(file.mimetype)) {
    res.status(400);
    throw new Error("Please upload a PDF or Word document");
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    res.status(400);
    throw new Error("File size should be less than 10MB");
  }

  // Create unique filename
  const fileName = `resume-${req.user._id}-${Date.now()}${path.extname(file.name)}`;
  const uploadPath = path.join(__dirname, "..", "uploads", "resumes", fileName);

  // Create uploads/resumes directory if it doesn't exist
  const dir = path.join(__dirname, "..", "uploads", "resumes");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    // Move file to upload directory
    await file.mv(uploadPath);
    console.log("Resume saved to:", uploadPath);
  } catch (error) {
    console.error("Error moving file:", error);
    res.status(500);
    throw new Error("Failed to upload resume: " + error.message);
  }

  // Update profile with resume URL
  const resumeUrl = `/uploads/resumes/${fileName}`;

  let profile = await Profile.findOne({ user: req.user._id });

  if (profile) {
    // Delete old resume if exists
    if (profile.resume) {
      const oldResumePath = path.join(__dirname, "..", profile.resume);
      if (fs.existsSync(oldResumePath)) {
        fs.unlinkSync(oldResumePath);
        console.log("Old resume deleted:", oldResumePath);
      }
    }

    profile.resume = resumeUrl;
    await profile.save();
  } else {
    // Create profile with resume
    profile = await Profile.create({
      user: req.user._id,
      name: req.user.name || "",
      email: req.user.email || "",
      resume: resumeUrl,
    });
  }

  res.json({
    success: true,
    resumeUrl: resumeUrl,
    message: "Resume uploaded successfully",
  });
});

// @desc    Delete profile
// @route   DELETE /api/profile
// @access  Private
const deleteProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id });

  if (profile) {
    // Delete associated files
    if (profile.profileImage) {
      const imagePath = path.join(__dirname, "..", profile.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    if (profile.resume) {
      const resumePath = path.join(__dirname, "..", profile.resume);
      if (fs.existsSync(resumePath)) {
        fs.unlinkSync(resumePath);
      }
    }

    await profile.deleteOne();
    res.json({ message: "Profile removed" });
  } else {
    res.status(404);
    throw new Error("Profile not found");
  }
});

// @desc    Get public profile (admin profile)
// @route   GET /api/profile/public
// @access  Public
const getPublicProfile = asyncHandler(async (req, res) => {
  // Récupérez l'utilisateur admin (vous pouvez le faire par rôle ou par ID spécifique)
  const User = require("../models/User");

  // Option 1: Trouver l'utilisateur avec le rôle 'admin'
  const adminUser = await User.findOne({ role: "admin" });

  if (!adminUser) {
    // Option 2: Si pas de rôle, prenez le premier utilisateur ou un ID spécifique
    // const adminUser = await User.findById('votre_admin_id_ici');
    res.status(404);
    throw new Error("Admin profile not found");
  }

  const profile = await Profile.findOne({ user: adminUser._id });

  if (profile) {
    res.json(profile);
  } else {
    res.status(404);
    throw new Error("Admin profile not found");
  }
});

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  uploadResume,
  deleteProfile,
  getPublicProfile,
};
