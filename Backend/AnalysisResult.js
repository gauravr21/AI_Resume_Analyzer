const mongoose = require('mongoose');

const AnalysisResultSchema = new mongoose.Schema({
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  jobDescription: {
    type: String,
    default: '',
  },
  overallScore: {
    type: Number,
    required: true,
  },
  resumeStrengthScore: {
    type: Number,
    default: 0,
  },
  matchScore: {
    type: Number,
    default: 0,
  },
  resumeSkills: {
    type: [String],
    default: [],
  },
  matchedSkills: {
    type: [String],
    default: [],
  },
  missingSkills: {
    type: [String],
    default: [],
  },
  suggestions: {
    type: [String],
    default: [],
  },
  predictedRoles: {
    type: [String],
    default: [],
  },
  detailedAnalysis: {
    sectionsFound: [String],
    impactScore: Number,
    verbScore: Number,
    wordCount: Number,
    sectionCount: Number,
    summary: String,
    structuredAnalysis: {
      strengths: [String],
      weaknesses: [String],
      improvements: [String]
    }
  },
  analyzedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AnalysisResult', AnalysisResultSchema);
