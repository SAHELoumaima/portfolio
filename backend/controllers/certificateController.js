const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinary');
const Certificate = require('../models/Certificate');

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Public
const getCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({}).sort({ date: -1 });
  res.json(certificates);
});

// @desc    Get single certificate
// @route   GET /api/certificates/:id
// @access  Public
const getCertificateById = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);
  
  if (certificate) {
    res.json(certificate);
  } else {
    res.status(404);
    throw new Error('Certificate not found');
  }
});

// @desc    Create a certificate
// @route   POST /api/certificates
// @access  Private
const createCertificate = asyncHandler(async (req, res) => {
  const { title, description, date, establishment } = req.body;
  
  // Upload image to Cloudinary
  let imageData = null;
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path);
    imageData = {
      publicId: result.public_id,
      url: result.secure_url,
    };
  }
  
  const certificate = await Certificate.create({
    title,
    description,
    image: imageData,
    date,
    establishment,
  });
  
  res.status(201).json(certificate);
});

// @desc    Update a certificate
// @route   PUT /api/certificates/:id
// @access  Private
const updateCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);
  
  if (certificate) {
    certificate.title = req.body.title || certificate.title;
    certificate.description = req.body.description || certificate.description;
    certificate.date = req.body.date || certificate.date;
    certificate.establishment = req.body.establishment || certificate.establishment;
    
    // Update image if new one is uploaded
    if (req.file) {
      // Delete old image from Cloudinary
      if (certificate.image && certificate.image.publicId) {
        await cloudinary.uploader.destroy(certificate.image.publicId);
      }
      const result = await cloudinary.uploader.upload(req.file.path);
      certificate.image = {
        publicId: result.public_id,
        url: result.secure_url,
      };
    }
    
    const updatedCertificate = await certificate.save();
    res.json(updatedCertificate);
  } else {
    res.status(404);
    throw new Error('Certificate not found');
  }
});

// @desc    Delete a certificate
// @route   DELETE /api/certificates/:id
// @access  Private
const deleteCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);
  
  if (certificate) {
    // Delete image from Cloudinary
    if (certificate.image && certificate.image.publicId) {
      await cloudinary.uploader.destroy(certificate.image.publicId);
    }
    
    await certificate.deleteOne();
    res.json({ message: 'Certificate removed' });
  } else {
    res.status(404);
    throw new Error('Certificate not found');
  }
});

module.exports = {
  getCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
};