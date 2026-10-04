// backend/models/Profile.js
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: '',
    },
    certification: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    jobTitle: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    resume: {
      type: String,
      default: '',
    },
    skills: {
      type: [String], // Array of strings
      default: [],
    },
    contactLinks: {
      email: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      discord: { type: String, default: '' },
      twitter: { type: String, default: '' },
      other: { type: Map, of: String, default: {} },
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;