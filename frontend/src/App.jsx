import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import TeacherDashboard from './components/TeacherDashboard';
import ParentDashboard from './components/ParentDashboard';
import { auth } from './firebase';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return unsubscribe;
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
        <header className="bg-blue-700 text-white p-4 shadow-md">
          <h1 className="text-xl font-bold">EduWhisper Portal</h1>
          {user && <button onClick={() => auth.signOut()} className="text-sm underline ml-4">Logout</button>}
        </header>

        <main className="p-4">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/dashboard" element={
              user ? (
                [cite_start]// For demo purposes, we let user toggle views. In real app, this comes from DB role [cite: 122]
                <DashboardRouter user={user} />
              ) : <Navigate to="/" />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

const DashboardRouter = ({ user }) => {
  const [role, setRole] = useState('parent'); // Default
  
  return (
    <div>
      <div className="mb-6 flex gap-4 justify-center">
        <button onClick={() => setRole('teacher')} className={`px-4 py-2 rounded ${role === 'teacher' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Teacher View</button>
        <button onClick={() => setRole('parent')} className={`px-4 py-2 rounded ${role === 'parent' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Parent View</button>
      </div>
      {role === 'teacher' ? <TeacherDashboard user={user} /> : <ParentDashboard user={user} />}
    </div>
  );
};

export default App;