import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  History, 
  ChevronRight, 
  Plus,
  LogOut,
  Sun,
  Moon,
  Clock
} from 'lucide-react';
import { getMyResumes } from '../services/api';

const Sidebar = ({ darkMode, toggleDarkMode }) => {
  const { user, logout, refreshTrigger } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [recentResumes, setRecentResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await getMyResumes();
        // Get last 5 resumes
        setRecentResumes(response.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching recent resumes for sidebar:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchRecent();
  }, [user, location.pathname, refreshTrigger]); // Refresh when user uploads or deletes something new

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Upload New', path: '/upload', icon: <Plus className="w-5 h-5" /> },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-colors duration-300 hidden md:flex">
      {/* Brand */}
      <div className="p-6">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">
            AI <span className="text-indigo-600">Resume Analyzer</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 px-2">Menu</div>
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
              isActive(link.path)
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            {link.icon}
            <span>{link.name}</span>
          </Link>
        ))}

        {/* Recent Activity Section */}
        <div className="pt-8 mb-4">
          <div className="flex items-center justify-between px-2 mb-4">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Recent Activity</span>
            <Clock className="w-3 h-3 text-gray-400" />
          </div>
          
          <div className="space-y-1">
            {loading ? (
              <div className="px-4 py-2 space-y-2">
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/2"></div>
              </div>
            ) : recentResumes.length > 0 ? (
              recentResumes.map((resume) => (
                <Link
                  key={resume._id}
                  to={`/insights/${resume._id}`}
                  className={`flex items-center justify-between group px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive(`/insights/${resume._id}`)
                      ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <span className="truncate pr-2">{resume.fileName}</span>
                  <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${isActive(`/insights/${resume._id}`) ? 'opacity-100' : ''}`} />
                </Link>
              ))
            ) : (
              <p className="px-4 py-2 text-xs text-gray-400 italic">No recent scans</p>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-900 space-y-2">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all"
        >
          {darkMode ? (
            <>
              <Sun className="w-5 h-5 text-yellow-500" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 text-indigo-500" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>

        <div className="pt-2 px-4 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white text-[10px] font-black shadow-lg">
            {user?.name?.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
