const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a project title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    image: {
      type: String, // Just store the URL as string for now
      required: true,
    },
    gallery: [
      {
        type: String, // Array of image URLs
      },
    ],
    githubLink: {
      type: String,
      default: "",
    },
    technologies: [
      {
        type: String,
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Project", projectSchema);
