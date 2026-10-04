const express = require('express');
const multer = require('multer');
const {
  getCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.route('/')
  .get(getCertificates)
  .post(protect, upload.single('image'), createCertificate);

router.route('/:id')
  .get(getCertificateById)
  .put(protect, upload.single('image'), updateCertificate)
  .delete(protect, deleteCertificate);

module.exports = router;