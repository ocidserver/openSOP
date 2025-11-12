const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const profileController = require('../controllers/profile.controller');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for profile photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/profile
 * @desc    Get current user profile
 * @access  Private (Authenticated)
 */
router.get('/', 
  profileController.getProfile
);

/**
 * @route   GET /api/profile/activity
 * @desc    Get user activity history
 * @access  Private (Authenticated)
 * @query   limit
 */
router.get('/activity', 
  profileController.getActivity
);

/**
 * @route   PUT /api/profile
 * @desc    Update current user profile
 * @access  Private (Authenticated)
 * @body    fullName, email, phoneNumber, nip
 */
router.put('/', 
  profileController.updateProfile
);

/**
 * @route   PUT /api/profile/password
 * @desc    Change password
 * @access  Private (Authenticated)
 * @body    currentPassword, newPassword, confirmPassword
 */
router.put('/password', 
  profileController.changePassword
);

/**
 * @route   POST /api/profile/photo
 * @desc    Upload profile photo
 * @access  Private (Authenticated)
 * @body    multipart/form-data with 'photo' field
 */
router.post('/photo', 
  upload.single('photo'), 
  profileController.uploadPhoto
);

/**
 * @route   DELETE /api/profile/photo
 * @desc    Delete profile photo
 * @access  Private (Authenticated)
 */
router.delete('/photo', 
  profileController.deletePhoto
);

module.exports = router;
