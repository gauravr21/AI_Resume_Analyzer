import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import useTitle from '../hooks/useTitle';
import { 
  FileText, 
  Upload, 
  TrendingUp, 
  Calendar, 
  ArrowRight,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Plus,
  Trash2
} from 'lucide-react';
import { getMyResumes, deleteResume } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const Dashboard = () => {
  useTitle('Dashboard');
  const { user, refreshResumes } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await getMyResumes();
        setResumes(response.data);
      } catch (error) {
        console.error('Error fetching resumes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent navigation to insights
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await deleteResume(id);
        setResumes(resumes.filter(r => r._id !== id));
        refreshResumes(); // Notify Sidebar to refresh
      } catch (error) {
        console.error('Error deleting resume:', error);
        alert('Failed to delete resume');
      }
    }
  };

  // Prepare chart data
  const analyzedResumes = resumes.filter(r => r.analysisResults).slice(0, 5).reverse();
  const latestAnalysis = resumes.find(r => r.analysisResults)?.analysisResults;

  const barData = {
    labels: analyzedResumes.map(r => r.fileName.substring(0, 10) + (r.fileName.length > 10 ? '...' : '')),
    datasets: [
      {
        label: 'Match Score (%)',
        data: analyzedResumes.map(r => r.analysisResults.overallScore),
        backgroundColor: 'rgba(79, 70, 229, 0.6)',
        borderColor: 'rgb(79, 70, 229)',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const pieData = latestAnalysis ? {
    labels: ['Matched Skills', 'Missing Skills'],
    datasets: [
      {
        data: [latestAnalysis.matchedSkills.length, latestAnalysis.missingSkills.length],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgb(107, 114, 128)',
          usePointStyle: true,
          padding: 20,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          display: false
        },
        ticks: {
          color: 'rgb(107, 114, 128)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgb(107, 114, 128)'
        }
      }
    }
  };

  const avgScore = resumes.length > 0 && resumes.filter(r => r.analysisResults).length > 0
    ? Math.round(resumes.filter(r => r.analysisResults).reduce((acc, curr) => acc + curr.analysisResults.overallScore, 0) / resumes.filter(r => r.analysisResults).length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Your personalized career analysis dashboard.</p>
        </div>
        <button 
          onClick={() => navigate('/upload')}
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Resumes', value: resumes.length.toString(), icon: <FileText className="text-blue-600 dark:text-blue-400" />, bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Avg. Match Score', value: avgScore > 0 ? `${avgScore}%` : '-', icon: <TrendingUp className="text-green-600 dark:text-green-400" />, bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Recent Scans', value: resumes.filter(r => r.analysisResults).length.toString(), icon: <Activity className="text-purple-600 dark:text-purple-400" />, bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Growth Potential', value: avgScore > 80 ? 'High' : avgScore > 50 ? 'Medium' : 'Rising', icon: <BarChart3 className="text-orange-600 dark:text-orange-400" />, bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{stat.value}</span>
            </div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-indigo-500" />
            Analysis History (Last 5)
          </h3>
          <div className="h-64">
            {analyzedResumes.length > 0 ? (
              <Bar data={barData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                <p className="text-gray-400 dark:text-gray-600 italic">No analysis data available yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <PieIcon className="w-5 h-5 mr-2 text-indigo-500" />
            Latest Skills Ratio
          </h3>
          <div className="h-64">
            {pieData ? (
              <Pie 
                data={pieData} 
                options={{
                  ...chartOptions,
                  scales: undefined // Pie charts don't have scales
                }} 
              />
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl text-center px-4">
                <p className="text-gray-400 dark:text-gray-600">Run an analysis to see your skills breakdown.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
          <button 
            onClick={() => navigate('/upload')}
            className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline"
          >
            Upload More
          </button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="text-indigo-400 w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No resumes yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-sm mx-auto">Upload your first resume to get started with AI analysis.</p>
              <button 
                onClick={() => navigate('/upload')}
                className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
              >
                <Upload className="w-5 h-5 mr-3" />
                Upload Your First Resume
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resumes.map((resume) => (
                <div 
                  key={resume._id} 
                  className="group p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-5">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[150px] sm:max-w-[200px]">
                        {resume.fileName}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 space-x-3">
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          {new Date(resume.uploadedAt).toLocaleDateString()}
                        </span>
                        {resume.analysisResults && (
                          <span className="flex items-center px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full font-bold">
                            {resume.analysisResults.overallScore}% Match
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => handleDelete(resume._id, e)}
                      className="p-3 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => navigate(`/insights/${resume._id}`)}
                      className="flex items-center p-3 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all group/btn"
                    >
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
