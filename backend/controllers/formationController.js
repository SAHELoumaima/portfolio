const asyncHandler = require('express-async-handler');
const Formation = require('../models/Formation');

// @desc    Get all formations
// @route   GET /api/formations
// @access  Public
const getFormations = asyncHandler(async (req, res) => {
  const formations = await Formation.find({}).sort({ dateDebut: -1 });
  res.json(formations);
});

// @desc    Get single formation
// @route   GET /api/formations/:id
// @access  Public
const getFormationById = asyncHandler(async (req, res) => {
  const formation = await Formation.findById(req.params.id);
  
  if (formation) {
    res.json(formation);
  } else {
    res.status(404);
    throw new Error('Formation not found');
  }
});

// @desc    Create a formation
// @route   POST /api/formations
// @access  Private
const createFormation = asyncHandler(async (req, res) => {
  const { title, description, dateDebut, dateFin } = req.body;
  
  const formation = await Formation.create({
    title,
    description,
    dateDebut,
    dateFin,
  });
  
  res.status(201).json(formation);
});

// @desc    Update a formation
// @route   PUT /api/formations/:id
// @access  Private
const updateFormation = asyncHandler(async (req, res) => {
  const formation = await Formation.findById(req.params.id);
  
  if (formation) {
    formation.title = req.body.title || formation.title;
    formation.description = req.body.description || formation.description;
    formation.dateDebut = req.body.dateDebut || formation.dateDebut;
    formation.dateFin = req.body.dateFin || formation.dateFin;
    
    const updatedFormation = await formation.save();
    res.json(updatedFormation);
  } else {
    res.status(404);
    throw new Error('Formation not found');
  }
});

// @desc    Delete a formation
// @route   DELETE /api/formations/:id
// @access  Private
const deleteFormation = asyncHandler(async (req, res) => {
  const formation = await Formation.findById(req.params.id);
  
  if (formation) {
    await formation.deleteOne();
    res.json({ message: 'Formation removed' });
  } else {
    res.status(404);
    throw new Error('Formation not found');
  }
});

module.exports = {
  getFormations,
  getFormationById,
  createFormation,
  updateFormation,
  deleteFormation,
};