import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Brain, 
  Target, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Briefcase,
  Lock,
  FileText,
  BarChart3,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import { performAnalysis, getAnalysisResult } from '../services/api';
import useTitle from '../hooks/useTitle';

const ScoreCircle = ({ score, label, type, disabled, size = "w-32 h-32" }) => {
  const isPercentage = type === 'percentage';
  const displayScore = Math.round(score || 0);
  
  return (
    <div className={`flex flex-col items-center transition-opacity duration-300 ${disabled ? 'opacity-40' : 'opacity-100'}`}>
      <div className={`relative ${size}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-100 dark:text-gray-800"
          />
          {!disabled && (
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="264"
              strokeDashoffset={264 - (264 * displayScore) / 100}
              className={`${
                displayScore >= 80 ? 'text-green-500' : 
                displayScore >= 60 ? 'text-yellow-500' : 'text-red-500'
              } transition-all duration-1000 ease-out`}
              strokeLinecap="round"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {disabled ? (
            <Lock className="w-6 h-6 text-gray-400" />
          ) : (
            <>
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                {displayScore}{isPercentage ? '%' : ''}
              </span>
              {!isPercentage && (
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">/ 100</span>
              )}
            </>
          )}
        </div>
      </div>
      <span className="mt-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">
        {label}
      </span>
    </div>
  );
};

const Insights = () => {
  useTitle('Analysis Insights');
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExistingAnalysis = async () => {
      try {
        const response = await getAnalysisResult(resumeId);
        setAnalysis(response.data);
      } catch (err) {
        console.log('No existing analysis found or error fetching it');
        setAnalysis(null);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchExistingAnalysis();
  }, [resumeId]);

  const handleRunAnalysis = async () => {
    if (!jobDescription.trim()) {
      setError('Please provide a job description for matching.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await performAnalysis({ resumeId, jobDescription });
      setAnalysis(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to perform analysis');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const hasJobDescription = analysis?.jobDescription && analysis.jobDescription.length > 0;
  const details = analysis?.detailedAnalysis;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Job Match
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Paste the job description you're targeting to see how well your resume matches.
            </p>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleRunAnalysis();
                }
              }}
              placeholder="Paste job description here..."
              className="w-full h-64 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm dark:text-white"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </p>
            )}
            <button
              onClick={handleRunAnalysis}
              disabled={loading}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all ${
                loading 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  Run AI Analysis
                </>
              )}
            </button>
          </div>

          {analysis?.predictedRoles && (
            <div className="bg-indigo-900 dark:bg-indigo-950 p-6 rounded-2xl text-white shadow-xl shadow-indigo-500/10">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-indigo-300" />
                Predicted Roles
              </h3>
              <div className="space-y-2">
                {analysis.predictedRoles.map((role, i) => (
                  <div key={i} className="flex items-center bg-indigo-800/50 dark:bg-indigo-900/50 p-3 rounded-lg border border-indigo-700/50">
                    <Briefcase className="w-4 h-4 mr-3 text-indigo-300" />
                    <span className="font-medium">{role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {!analysis ? (
            <div className="bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-12 text-center">
              <div className="bg-white dark:bg-gray-900 w-20 h-20 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ready for Insights?</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Paste a job description and click "Run AI Analysis" to see your match score and detailed feedback.
              </p>
            </div>
          ) : (
            <>
              {/* Score Card */}
              <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex flex-wrap justify-center gap-6">
                    <ScoreCircle 
                      score={analysis.resumeStrengthScore} 
                      label="Resume Score" 
                      type="score" 
                    />
                    <ScoreCircle 
                      score={analysis.matchScore} 
                      label="Match Rate" 
                      type="percentage" 
                      disabled={!hasJobDescription}
                    />
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {hasJobDescription ? 'Job Match Analysis!' : 'Resume Strength Analysis!'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                      {hasJobDescription 
                        ? `Your resume has a ${Math.round(analysis.matchScore)}% match for this role, with a base resume strength of ${Math.round(analysis.resumeStrengthScore)}/100.`
                        : `Your overall resume strength score is ${Math.round(analysis.resumeStrengthScore)}/100. Based on your identified skills and content depth.`
                      }
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                      {analysis.matchedSkills && analysis.matchedSkills.length > 0 && (
                        <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-bold border border-green-100 dark:border-green-900/50">
                          {analysis.matchedSkills.length} Skills Matched
                        </span>
                      )}
                      {analysis.resumeSkills && (
                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                          {analysis.resumeSkills.length} Skills Identified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Card */}
              {details && (details.summary || details.structuredAnalysis) && (
                <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-indigo-500" />
                    Detailed Analysis
                  </h3>
                  
                  {details.structuredAnalysis ? (
                    <div className="space-y-6">
                      {/* Strengths */}
                      {details.structuredAnalysis.strengths?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mb-3 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Strengths
                          </h4>
                          <ul className="space-y-2">
                            {details.structuredAnalysis.strengths.map((point, i) => (
                              <li key={i} className="flex items-start text-gray-700 dark:text-gray-300 bg-green-50/50 dark:bg-green-900/10 p-3 rounded-xl border border-green-100/50 dark:border-green-900/20">
                                <ChevronRight className="w-4 h-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Weaknesses */}
                      {details.structuredAnalysis.weaknesses?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-3 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Weaknesses
                          </h4>
                          <ul className="space-y-2">
                            {details.structuredAnalysis.weaknesses.map((point, i) => (
                              <li key={i} className="flex items-start text-gray-700 dark:text-gray-300 bg-red-50/50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100/50 dark:border-red-900/20">
                                <ChevronRight className="w-4 h-4 mr-2 text-red-500 mt-1 flex-shrink-0" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Improvements */}
                      {details.structuredAnalysis.improvements?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3 flex items-center">
                            <Zap className="w-4 h-4 mr-2" />
                            Improvements
                          </h4>
                          <ul className="space-y-2">
                            {details.structuredAnalysis.improvements.map((point, i) => (
                              <li key={i} className="flex items-start text-gray-700 dark:text-gray-300 bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-xl border border-indigo-100/50 dark:border-indigo-900/20">
                                <ChevronRight className="w-4 h-4 mr-2 text-indigo-500 mt-1 flex-shrink-0" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        "{details.summary}"
                      </p>
                    </div>
                  )}

                  <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Impact: {Math.round(details.impactScore)}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Verbs: {Math.round(details.verbScore)}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Sections: {details.sectionCount}/5</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skills */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                    Skills Analysis
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                        Resume Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(analysis.resumeSkills || []).map((skill, i) => {
                          const isMatched = analysis.matchedSkills?.some(ms => ms.toLowerCase() === skill.toLowerCase());
                          return (
                            <span 
                              key={i} 
                              className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                                isMatched 
                                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800' 
                                  : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800'
                              }`}
                            >
                              <CheckCircle2 className={`w-3 h-3 mr-1.5 ${isMatched ? 'text-green-500' : 'text-indigo-400'}`} />
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    {analysis.missingSkills && analysis.missingSkills.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Missing from Job Description</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.missingSkills.map((skill, i) => (
                            <span key={i} className="flex items-center px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium border border-red-100 dark:border-red-900/50">
                              <AlertCircle className="w-3 h-3 mr-1.5 text-red-500 dark:text-red-400" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                    AI Suggestions
                  </h3>
                  <div className="space-y-3">
                    {analysis.suggestions.map((suggestion, i) => (
                      <div key={i} className="flex items-start p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <ChevronRight className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400 mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{suggestion}</p>
                      </div>
                    ))}
                    {analysis.suggestions.length === 0 && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm italic">No specific suggestions at this time. Your resume looks great!</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Insights;
