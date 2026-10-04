const express = require('express');
const { 
  getProfile, 
  updateProfile, 
  uploadProfileImage, 
  uploadResume, 
  deleteProfile,
  getPublicProfile  // Importez la nouvelle fonction
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Route publique pour le profil admin (sans authentification)
router.get('/public', getPublicProfile);

// Routes protégées pour le profil de l'utilisateur connecté
router.route('/')
  .get(protect, getProfile)
  .post(protect, updateProfile)
  .delete(protect, deleteProfile);

// File upload routes
router.post('/upload-image', protect, uploadProfileImage);
router.post('/upload-resume', protect, uploadResume);

module.exports = router;