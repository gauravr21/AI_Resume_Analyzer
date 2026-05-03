const axios = require('axios');
const Resume = require('../models/Resume');
const AnalysisResult = require('../models/AnalysisResult');

const AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000';

exports.performAnalysis = async (req, res) => {
  const { resumeId, jobDescription } = req.body;

  try {
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const resumeText = resume.originalText;

    // 1. Extract Skills
    const skillsRes = await axios.post(`${AI_SERVICE_URL}/extract_skills`, { text: resumeText });
    const resumeSkills = skillsRes.data.skills;

    // 2. Predict Role
    const rolesRes = await axios.post(`${AI_SERVICE_URL}/predict_role`, { text: resumeText });
    const predictedRoles = rolesRes.data.predicted_roles;

    // 3. Detailed Analysis
    const detailedRes = await axios.post(`${AI_SERVICE_URL}/detailed_analysis`, { text: resumeText });
    const details = detailedRes.data;

    let overallScore = 0;
    let resumeStrengthScore = 0;
    let matchScore = 0;
    let matchedSkills = [];
    let missingSkills = [];
    let suggestions = [];

    // Calculate Resume Strength (Conservative & Logical)
    const baseSkillScore = Math.min(resumeSkills.length * 2, 20); // Max 20 from skills
    const sectionScore = (details.section_count / 5) * 30; // Max 30 from sections
    const impactBonus = (details.impact_score * 0.1) + (details.verb_score * 0.1); // Max 20 from metrics
    const lengthScore = Math.min((details.word_count / 500) * 30, 30); // Max 30 for length/depth
    
    resumeStrengthScore = Math.round(baseSkillScore + sectionScore + impactBonus + lengthScore);
    resumeStrengthScore = Math.max(0, Math.min(100, resumeStrengthScore));

    // Add specific suggestions from detailed analysis
    if (!details.sectionsFound || !details.sectionsFound.includes('Experience')) {
      suggestions.push("Your Experience section is missing or not clearly labeled.");
    }
    if (!details.sectionsFound || !details.sectionsFound.includes('Education')) {
      suggestions.push("Make sure to clearly list your Education background.");
    }
    if (details.impactScore < 40) {
      suggestions.push("Add more metrics and quantifiable results (e.g., 'Improved efficiency by 20%').");
    }
    if (details.verbScore < 50) {
      suggestions.push("Use stronger action verbs to describe your responsibilities.");
    }

    // 4. Match Job (if description provided)
    if (jobDescription) {
      const matchRes = await axios.post(`${AI_SERVICE_URL}/match_job`, {
        resume_text: resumeText,
        job_text: jobDescription
      });
      
      let aiScore = matchRes.data.match_score;

      // Extract skills from job description
      const jobSkillsRes = await axios.post(`${AI_SERVICE_URL}/extract_skills`, { text: jobDescription });
      const jobSkills = jobSkillsRes.data.skills;

      matchedSkills = resumeSkills.filter(skill => 
        jobSkills.some(js => js.toLowerCase() === skill.toLowerCase())
      );
      missingSkills = jobSkills.filter(skill => 
        !resumeSkills.some(rs => rs.toLowerCase() === skill.toLowerCase())
      );

      // Skill coverage score (weighted heavily)
      const skillScore = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) * 100 : 85;
      
      // Blend AI similarity score and skill coverage (50/50 weighted for balance)
      matchScore = (aiScore * 0.5) + (skillScore * 0.5);

      // Add a small "Fuzzy Match" bonus if more than 50% of skills are present
      if (skillScore > 50) matchScore += 10;

      // Apply a smaller penalty for length mismatch (only if extremely short)
      if (resumeText.length < jobDescription.length * 0.2) {
        matchScore -= 10;
      }

      matchScore = Math.round(Math.max(0, Math.min(100, matchScore)));
      overallScore = matchScore;

      if (missingSkills.length > 0) {
        suggestions.push(`Consider adding these skills to your resume: ${missingSkills.slice(0, 5).join(', ')}`);
      }
      
      if (overallScore < 70) {
        suggestions.push("Tailor your resume more closely to the job description keywords.");
      }
    } else {
      // General analysis if no job description
      overallScore = resumeStrengthScore;
      matchedSkills = resumeSkills;
      suggestions.push("Add a specific job description for a more detailed match analysis.");
    }

    // Add general suggestions
    if (resumeText.split(' ').length < 200) {
      suggestions.push("Your resume seems a bit short. Consider adding more detail about your projects and impact.");
    }
    
    const analysisResult = new AnalysisResult({
      resumeId,
      jobDescription,
      overallScore,
      resumeStrengthScore,
      matchScore,
      resumeSkills,
      matchedSkills,
      missingSkills,
      suggestions,
      predictedRoles,
      detailedAnalysis: {
        sectionsFound: details.sections_found,
        impactScore: details.impact_score,
        verbScore: details.verb_score,
        wordCount: details.word_count,
        sectionCount: details.section_count,
        summary: details.summary || '',
        structuredAnalysis: {
          strengths: details.structured_analysis?.strengths || [],
          weaknesses: details.structured_analysis?.weaknesses || [],
          improvements: details.structured_analysis?.improvements || []
        }
      }
    });

    await analysisResult.save();

    res.status(201).json(analysisResult);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ message: 'Error performing analysis', error: error.message });
  }
};

exports.getAnalysis = async (req, res) => {
  try {
    const analysis = await AnalysisResult.findOne({ resumeId: req.params.resumeId }).sort({ analyzedAt: -1 });
    if (!analysis) {
      return res.status(404).json({ message: 'No analysis found for this resume' });
    }
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analysis', error: error.message });
  }
};
