const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const resumeController = require('../controllers/resumeController');

// @route   POST /api/resume/upload
// @desc    Upload and parse resume
// @access  Private
router.post('/upload', auth, resumeController.uploadResume);

// @route   GET /api/resume/my-resumes
// @desc    Get all resumes of the current user
// @access  Private
router.get('/my-resumes', auth, resumeController.getMyResumes);

// @route   DELETE /api/resume/:id
// @desc    Delete a resume and its analysis results
// @access  Private
router.delete('/:id', auth, resumeController.deleteResume);

module.exports = router;
