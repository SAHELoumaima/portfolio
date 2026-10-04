const express = require('express');
const {
  getFormations,
  getFormationById,
  createFormation,
  updateFormation,
  deleteFormation,
} = require('../controllers/formationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getFormations)
  .post(protect, createFormation);

router.route('/:id')
  .get(getFormationById)
  .put(protect, updateFormation)
  .delete(protect, deleteFormation);

module.exports = router;