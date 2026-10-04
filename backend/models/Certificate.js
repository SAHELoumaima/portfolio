const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      publicId: { type: String, required: true },
      url: { type: String, required: true },
    },
    date: {
      type: Date,
      required: true,
    },
    establishment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Certificate = mongoose.model('Certificate', certificateSchema);
module.exports = Certificate;