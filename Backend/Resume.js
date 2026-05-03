const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  originalText: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for analysis results
ResumeSchema.virtual('analysisResults', {
  ref: 'AnalysisResult',
  localField: '_id',
  foreignField: 'resumeId',
  justOne: true // Getting the most recent analysis
});

module.exports = mongoose.model('Resume', ResumeSchema);
