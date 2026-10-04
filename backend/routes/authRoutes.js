const express = require("express");
const {
  registerUser,
  registerAdmin,
  setupFirstAdmin,
  loginUser,
  getUserProfile,
} = require("../controllers/authController");
const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/register-admin", registerAdmin); 
router.post('/setup-first-admin', setupFirstAdmin);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);

module.exports = router;
