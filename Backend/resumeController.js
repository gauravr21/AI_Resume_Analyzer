const Resume = require('../models/Resume');
const AnalysisResult = require('../models/AnalysisResult');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .pdf and .docx files are allowed!'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).single('resume');

// @route   POST /api/resume/upload
// @desc    Upload and parse resume
// @access  Private
exports.uploadResume = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      let extractedText = '';

      if (req.file.mimetype === 'application/pdf') {
        const parser = new pdf.PDFParse({ data: req.file.buffer });
        const result = await parser.getText();
        extractedText = result.text;
        await parser.destroy();
      } else if (
        req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        path.extname(req.file.originalname).toLowerCase() === '.docx'
      ) {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        extractedText = result.value;
      }

      // Clean extracted text: remove extra whitespace and empty lines
      const cleanText = extractedText
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .replace(/\n{3,}/g, '\n\n') // Max 2 newlines
        .trim();

      if (!cleanText) {
        return res.status(400).json({ message: 'Could not extract text from file' });
      }

      const newResume = new Resume({
        userId: req.user.id,
        fileName: req.file.originalname,
        originalText: cleanText,
      });

      await newResume.save();

      res.status(201).json({
        message: 'Resume uploaded and parsed successfully',
        resume: {
          id: newResume._id,
          fileName: newResume.fileName,
          uploadedAt: newResume.uploadedAt,
        },
      });
    } catch (error) {
      console.error('Error parsing resume:', error);
      res.status(500).json({ message: 'Error processing resume file' });
    }
  });
};

// @route   GET /api/resume/my-resumes
// @desc    Get all resumes of the current user
// @access  Private
exports.getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .sort({ uploadedAt: -1 })
      .populate('analysisResults');
    res.json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   DELETE /api/resume/:id
// @desc    Delete a resume and its analysis results
// @access  Private
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Check user ownership
    if (resume.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Delete associated analysis results first
    await AnalysisResult.deleteMany({ resumeId: req.params.id });
    
    // Delete the resume
    await Resume.findByIdAndDelete(req.params.id);

    res.json({ message: 'Resume and analysis results removed' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
