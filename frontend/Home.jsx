import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useTitle from '../hooks/useTitle';
import { 
  FileText, 
  Search, 
  TrendingUp, 
  Lightbulb, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const Home = () => {
  useTitle('Home');
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const features = [
    {
      title: 'Keyword Optimization',
      description: 'Identify critical keywords missing from your resume that recruiters are looking for.',
      icon: <Search className="w-6 h-6 text-blue-500" />,
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'ATS Scoring',
      description: 'See how well your resume ranks with modern applicant tracking systems used by top firms.',
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Actionable Insights',
      description: 'Get personalized feedback to improve every section of your CV for maximum impact.',
      icon: <Lightbulb className="w-6 h-6 text-yellow-500" />,
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      title: 'Skill Gap Analysis',
      description: 'Discover the exact skills you need to develop to qualify for your dream roles.',
      icon: <Zap className="w-6 h-6 text-purple-500" />,
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Secure & Private',
      description: 'Your data is encrypted and handled with the highest level of privacy and security.',
      icon: <ShieldCheck className="w-6 h-6 text-indigo-500" />,
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      title: 'Instant Results',
      description: 'Upload your resume and get a comprehensive analysis in seconds, not minutes.',
      icon: <FileText className="w-6 h-6 text-rose-500" />,
      bg: 'bg-rose-50 dark:bg-rose-900/20',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload Resume',
      description: 'Drag and drop your resume in PDF or Word format to our secure platform.',
    },
    {
      step: '02',
      title: 'AI Analysis',
      description: 'Our advanced AI models scan your resume for keywords, formatting, and impact.',
    },
    {
      step: '03',
      title: 'Get Insights',
      description: 'Review your score and follow actionable advice to optimize your profile.',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold mb-8 border border-indigo-100 dark:border-indigo-800"
            >
              <Zap className="w-4 h-4 mr-2 fill-current" />
              Revolutionizing Job Search with AI
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-tight leading-[1.1]">
              Master Your Career with <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                AI Resume Analyzer
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Upload your resume and get instant, AI-powered feedback to help you land your dream job faster. Optimize for ATS and stand out to recruiters.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link
                to="/signup"
                className="group px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-500/25 active:scale-95 flex items-center justify-center"
              >
                Get Started for Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-800 rounded-xl font-bold text-lg hover:border-indigo-600 dark:hover:border-indigo-500 transition-all active:scale-95 flex items-center justify-center"
              >
                Learn More
              </Link>
            </div>

            <motion.div 
              className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">Trusted by professionals from</p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
                <div className="text-2xl font-black text-gray-900 dark:text-white">TECHGIANT</div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">STARTUP.IO</div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">CORP.NET</div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">FUTURE_CO</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Everything you need to optimize your resume and get noticed by recruiters.</p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-indigo-500/5"
              >
                <div className={`p-3 rounded-xl ${feature.bg} inline-block mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">How it works?</h2>
              <div className="space-y-8">
                {steps.map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="flex gap-6"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-tr from-indigo-600 to-blue-600 p-1 rounded-3xl shadow-2xl"
              >
                <div className="bg-white dark:bg-gray-900 rounded-[calc(1.5rem-2px)] p-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl aspect-[4/3] flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Resume Score: 87/100</h4>
                      <p className="text-gray-500 dark:text-gray-400">Analysis completed successfully!</p>
                      <div className="mt-8 space-y-3">
                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-indigo-600"
                            initial={{ width: 0 }}
                            whileInView={{ width: '87%' }}
                            transition={{ delay: 0.5, duration: 1 }}
                          />
                        </div>
                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-tighter">
                          <span>Progressive Score</span>
                          <span>Excellent</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400/20 blur-2xl rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-indigo-600 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-indigo-500/20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Ready to land your dream job?</h2>
            <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of job seekers who have optimized their resumes with our AI engine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl active:scale-95 flex items-center justify-center"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-indigo-700 text-white border border-indigo-500 rounded-xl font-bold text-lg hover:bg-indigo-800 transition-all active:scale-95 flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
