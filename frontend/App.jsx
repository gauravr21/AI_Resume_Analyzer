import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import UploadResume from './pages/UploadResume';
import Insights from './pages/Insights';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const AppContent = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const mainRef = useRef(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Scroll to top on route change
  useEffect(() => {
    // Use requestAnimationFrame to ensure the scroll reset happens after the DOM has updated
    const handleScroll = () => {
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    };

    const timeoutId = setTimeout(handleScroll, 0);
    const animationId = requestAnimationFrame(handleScroll);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationId);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Define which pages should show the Sidebar
  const isAppPage = ['/dashboard', '/upload', '/insights'].some(path => location.pathname.startsWith(path));
  // Authenticated users on the home page should see the Navbar with a "Go to Dashboard" button, not the Sidebar.
  const showSidebar = user && isAppPage;

  return (
    <div className={`min-h-screen bg-white dark:bg-gray-950 flex transition-colors duration-300 ${showSidebar ? 'flex-col md:flex-row' : 'flex-col'}`}>
      {/* Sidebar for App Pages */}
      {showSidebar && <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
      
      {/* Mobile Header for App Pages */}
      {showSidebar && <MobileHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar for Public Pages (including Home for logged in users) */}
        {!isAppPage && <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
        
        <main ref={mainRef} className="flex-1 overflow-y-auto custom-scrollbar">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <UploadResume />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/insights/:resumeId" 
              element={
                <ProtectedRoute>
                  <Insights />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          
          {/* Footer only for non-app pages */}
          {!isAppPage && (
            <footer className="py-12 border-t border-gray-100 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-950 transition-colors duration-300">
              <p>© {new Date().getFullYear()} Resume Analyzer. Built for builders.</p>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
