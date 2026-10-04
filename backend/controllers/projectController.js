const asyncHandler = require("express-async-handler");
const Project = require("../models/Project");
const fs = require("fs");
const path = require("path");


const getProjects = asyncHandler(async (req, res) => {
  const { visibleOnly } = req.query;
  let filter = {};

  if (visibleOnly === "true") {
    filter.isVisible = true;
  }

  const projects = await Project.find(filter).sort({ date: -1, createdAt: -1 });
  res.json({
    success: true,
    count: projects.length,
    projects,
  });
});


const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  res.json({
    success: true,
    project,
  });
});


// Create a new project with file upload
const createProject = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: "No image file uploaded" 
      });
    }

    // Handle technologies - support both string and array formats
    let technologies = [];
    if (req.body.technologies) {
      // If it's a string, try to parse it
      if (typeof req.body.technologies === 'string') {
        try {
          // Try to parse as JSON first
          technologies = JSON.parse(req.body.technologies);
        } catch (e) {
          // If JSON parsing fails, split by comma
          technologies = req.body.technologies.split(',').map(item => item.trim());
        }
      } else if (Array.isArray(req.body.technologies)) {
        // If it's already an array, use it directly
        technologies = req.body.technologies;
      }
    }

    // Create project in database
    const projectData = {
      title: req.body.title,
      description: req.body.description,
      technologies: technologies,
      githubLink: req.body.githubLink || "",
      liveLink: req.body.liveLink || "",
      category: req.body.category || "web",
      image: `/uploads/${req.file.filename}`
    };

    const project = new Project(projectData);
    await project.save();

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project
    });

  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  // Update 
  if (req.body.title) project.title = req.body.title;
  if (req.body.description) project.description = req.body.description;
  if (req.body.githubLink !== undefined)
    project.githubLink = req.body.githubLink;
  if (req.body.date) project.date = new Date(req.body.date);
  if (req.body.isVisible !== undefined) {
    project.isVisible =
      req.body.isVisible === "true" || req.body.isVisible === true;
  }

  if (req.body.technologies) {
    project.technologies = req.body.technologies
      .split(",")
      .map((tech) => tech.trim());
  }

  if (req.files && req.files.image) {
    if (project.image) {
      const oldImagePath = path.join(__dirname, "..", project.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    project.image = `/uploads/${req.files.image[0].filename}`;
  }


  if (req.files && req.files.gallery) {
    const newGalleryUrls = req.files.gallery.map(
      (file) => `/uploads/${file.filename}`,
    );
    project.gallery = [...project.gallery, ...newGalleryUrls];
  }

  const updatedProject = await project.save();

  res.json({
    success: true,
    message: "Project updated successfully",
    project: updatedProject,
  });
});


const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  // Delete 
  if (project.image) {
    const imagePath = path.join(__dirname, "..", project.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  // Delete 
  if (project.gallery && project.gallery.length > 0) {
    project.gallery.forEach((galleryPath) => {
      const fullPath = path.join(__dirname, "..", galleryPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });
  }

  await project.deleteOne();

  res.json({
    success: true,
    message: "Project removed successfully",
  });
});

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
