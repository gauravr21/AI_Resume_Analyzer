import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { uploadResume, performAnalysis } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useTitle from '../hooks/useTitle';

const UploadResume = () => {
  useTitle('Upload Resume');
  const { refreshResumes } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.docx')) {
      setError('Please upload a PDF or DOCX file.');
      setFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      setFile(null);
      return;
    }

    setFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const uploadRes = await uploadResume(formData);
      const resumeId = uploadRes.data.resume.id;
      
      setSuccess(true);
      refreshResumes(); // Notify Sidebar to refresh
      
      // Perform initial general analysis (without job description)
      try {
        await performAnalysis({ resumeId });
      } catch (analysisErr) {
        console.error('Initial analysis failed:', analysisErr);
        // We still redirect because the upload was successful
      }

      setTimeout(() => {
        navigate(`/insights/${resumeId}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl tracking-tight">
          Upload Your Resume
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Get started by uploading your resume in PDF or DOCX format.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 shadow-xl rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="p-8">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 group ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx"
                className="hidden"
              />
              <div className={`mx-auto h-20 w-20 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isDragging ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-500'}`}>
                <Upload className="h-10 w-10" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Drag and drop your resume here
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                or click to browse from your computer
              </p>
              <div className="mt-8 flex justify-center gap-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                <span>PDF</span>
                <span>•</span>
                <span>DOCX</span>
                <span>•</span>
                <span>MAX 10MB</span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="bg-indigo-100 dark:bg-indigo-900/40 p-4 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-inner">
                    <FileText size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!loading && !success && (
                  <button
                    onClick={removeFile}
                    className="p-3 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  >
                    <X size={24} />
                  </button>
                )}
              </div>

              {success && (
                <div className="mt-8 flex items-center justify-center text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/20 p-5 rounded-xl border border-green-100 dark:border-green-900/50">
                  <CheckCircle className="mr-3" size={24} />
                  Resume uploaded successfully! Redirecting...
                </div>
              )}

              {error && (
                <div className="mt-8 flex items-center justify-center text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 p-5 rounded-xl border border-red-100 dark:border-red-900/50">
                  <AlertCircle className="mr-3" size={24} />
                  {error}
                </div>
              )}

              <div className="mt-10 flex justify-center">
                {!success && (
                  <button
                    onClick={handleUpload}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl transition-all transform active:scale-[0.98] ${
                      loading
                        ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing Resume...
                      </span>
                    ) : (
                      'Analyze Resume'
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { step: '1', title: 'Upload', desc: 'Quickly upload your PDF or DOCX resume.', color: 'blue' },
          { step: '2', title: 'Analyze', desc: 'Our AI extracts and understands your experience.', color: 'indigo' },
          { step: '3', title: 'Improve', desc: 'Get actionable feedback to land your dream job.', color: 'purple' }
        ].map((item, i) => (
          <div key={i} className="text-center p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className={`bg-${item.color}-100 dark:bg-${item.color}-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-${item.color}-600 dark:text-${item.color}-400 font-bold text-xl`}>
              {item.step}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.title}</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadResume;
