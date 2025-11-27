import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import TeacherDashboard from './components/TeacherDashboard';
import ParentDashboard from './components/ParentDashboard';
import { auth } from './firebase';

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

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
        <header className="bg-blue-700 text-white p-4 shadow-md flex justify-between items-center">
          <h1 className="text-xl font-bold">EduWhisper Portal</h1>
          {user && <button onClick={() => auth.signOut()} className="text-sm bg-blue-800 px-3 py-1 rounded hover:bg-blue-600">Logout</button>}
        </header>

        <main className="p-4">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/dashboard" element={
              user ? <DashboardRouter user={user} /> : <Navigate to="/" />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

const DashboardRouter = ({ user }) => {
  const [role, setRole] = useState('teacher');
  
  return (
    <div>
      <div className="mb-6 flex gap-4 justify-center bg-white p-2 rounded shadow-sm max-w-md mx-auto">
        <button onClick={() => setRole('teacher')} className={`flex-1 px-4 py-2 rounded transition ${role === 'teacher' ? 'bg-blue-600 text-white font-bold' : 'bg-gray-100 text-gray-600'}`}>Teacher View</button>
        <button onClick={() => setRole('parent')} className={`flex-1 px-4 py-2 rounded transition ${role === 'parent' ? 'bg-green-600 text-white font-bold' : 'bg-gray-100 text-gray-600'}`}>Parent View</button>
      </div>
      {role === 'teacher' ? <TeacherDashboard user={user} /> : <ParentDashboard user={user} />}
    </div>
  );
};

export default App;