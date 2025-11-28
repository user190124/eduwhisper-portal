import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import Login from './components/Login';
import TeacherDashboard from './components/TeacherDashboard';
import ParentDashboard from './components/ParentDashboard';
import { motion, AnimatePresence } from 'framer-motion';

// --- COMPONENTS ---

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-500 font-medium animate-pulse">Initializing EduWhisper...</p>
  </div>
);

const Navbar = ({ user }) => (
  <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm px-6 py-4 flex justify-between items-center transition-all">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
        E
      </div>
      <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700">
        EduWhisper
      </h1>
    </div>
    
    {user && (
      <button
        onClick={() => auth.signOut()}
        className="group flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-red-500 transition-colors bg-white/50 hover:bg-red-50 rounded-full border border-gray-200"
      >
        <span>Logout</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    )}
  </nav>
);

const RoleSwitcher = ({ role, setRole }) => {
  const roles = [
    { id: 'teacher', label: 'Teacher View', icon: '👨‍🏫' },
    { id: 'parent', label: 'Parent View', icon: '👨‍👩‍👧' }
  ];

  return (
    <div className="flex justify-center mb-8">
      <div className="bg-gray-200/80 p-1 rounded-full flex relative shadow-inner">
        {roles.map((r) => (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors duration-200 flex items-center gap-2 ${
              role === r.id ? 'text-blue-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-lg">{r.icon}</span>
            {r.label}
            {role === r.id && (
              <motion.div
                layoutId="activePill"
                className="absolute inset-0 bg-white shadow-md rounded-full -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD ROUTER ---

const DashboardRouter = ({ user }) => {
  const [role, setRole] = useState('parent'); 

  return (
    <div className="max-w-7xl mx-auto">
      {/* Introduction Text */}
      <div className="text-center mb-8 mt-4">
        <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
        <p className="text-gray-500">Our Trusted User</p>
      </div>

      <RoleSwitcher role={role} setRole={setRole} />

      <AnimatePresence mode="wait">
        <motion.div
          key={role}
          initial={{ opacity: 0, x: role === 'teacher' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: role === 'teacher' ? 20 : -20 }}
          transition={{ duration: 0.3 }}
        >
          {role === 'teacher' ? (
            <TeacherDashboard user={user} />
          ) : (
            <ParentDashboard user={user} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// --- APP ROOT ---

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-800 relative overflow-hidden">
        
        {/* Background Blobs (Atmosphere) */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <Navbar user={user} />

        <main className="p-4 md:p-8">
          <Routes>
            <Route
              path="/"
              element={user ? <Navigate to="/dashboard" /> : <Login />}
            />
            <Route
              path="/dashboard"
              element={
                user ? <DashboardRouter user={user} /> : <Navigate to="/" />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;