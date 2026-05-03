const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/perform', authMiddleware, analysisController.performAnalysis);
router.get('/:resumeId', authMiddleware, analysisController.getAnalysis);

module.exports = router;
