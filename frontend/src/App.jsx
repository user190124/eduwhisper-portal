import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// --- FIREBASE CONFIGURATION ---
// TODO: Replace with your actual values from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

// --- API URL CONFIGURATION ---
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5001/api/activities' 
  : '/api/activities';

// --- COMPONENTS ---

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Login failed. Check credentials.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">EduWhisper Portal</h2>
      {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input 
          type="email" placeholder="Email" value={email} 
          onChange={e=>setEmail(e.target.value)} 
          className="border border-gray-300 p-3 rounded" required 
        />
        <input 
          type="password" placeholder="Password" value={password} 
          onChange={e=>setPassword(e.target.value)} 
          className="border border-gray-300 p-3 rounded" required 
        />
        <button type="submit" className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700">Sign In</button>
      </form>
    </div>
  );
};

const TeacherDashboard = ({ user }) => {
  const [formData, setFormData] = useState({ studentName: '', type: 'Attendance', details: '' });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  useEffect(() => {
    const syncOfflineData = async () => {
      const offlineData = JSON.parse(localStorage.getItem('offlineData') || '[]');
      if (offlineData.length > 0 && isOnline) {
        setStatus('Syncing offline data...');
        try {
          const token = await user.getIdToken();
          for (const data of offlineData) {
            await axios.post(API_URL, data, { headers: { Authorization: `Bearer ${token}` } });
          }
          localStorage.removeItem('offlineData');
          setStatus('Offline data synced!');
        } catch (err) {
          setStatus('Sync failed. Will retry later.');
        }
      }
    };
    if (isOnline) syncOfflineData();
  }, [user, isOnline]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Processing...');
    
    let attachmentUrl = '';
    let attachmentType = '';

    try {
      if (file && isOnline) {
        setStatus('Uploading file...');
        const fileRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        attachmentUrl = await getDownloadURL(snapshot.ref);
        attachmentType = file.type.startsWith('image/') ? 'image' : 'document';
      } else if (file && !isOnline) {
        setStatus('Error: Cannot upload files while offline.');
        return;
      }

      const payload = { ...formData, attachmentUrl, attachmentType, date: new Date() };
      const token = await user.getIdToken();
      
      await axios.post(API_URL, payload, { headers: { Authorization: `Bearer ${token}` } });

      setStatus('Activity logged successfully!');
      setFormData({ studentName: '', type: 'Attendance', details: '' });
      setFile(null);

    } catch (error) {
      if (!isOnline) {
        const payload = { ...formData, attachmentUrl: '', attachmentType: '', date: new Date() };
        const currentOffline = JSON.parse(localStorage.getItem('offlineData') || '[]');
        localStorage.setItem('offlineData', JSON.stringify([...currentOffline, payload]));
        setStatus('Network error. Text data saved offline.');
      } else {
        setStatus('Error submitting data.');
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Teacher Activity Log</h2>
        <span className={`px-2 py-1 text-xs rounded ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input className="border p-2 rounded" placeholder="Student Name" value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} required />
        <select className="border p-2 rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
          <option>Attendance</option>
          <option>Task</option>
          <option>Note</option>
        </select>
        <textarea className="border p-2 rounded" placeholder="Details..." value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} required />
        <input type="file" onChange={e => setFile(e.target.files[0])} disabled={!isOnline} className="block w-full text-sm text-gray-500" />
        <button className="bg-blue-600 text-white p-2 rounded">Log Activity</button>
      </form>
      {status && <p className="mt-2 text-sm text-blue-600">{status}</p>}
    </div>
  );
};

const ParentDashboard = ({ user }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = await user.getIdToken();
        const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
        setActivities(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [user]);

  if (loading) return <div className="text-center p-8">Loading updates...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Student Activity Feed</h2>
      <div className="space-y-4">
        {activities.map(act => (
          <div key={act._id} className="bg-white border p-4 rounded shadow-sm">
            <div className="flex justify-between font-bold">
              <span>{act.studentName}</span>
              <span className="text-xs text-gray-500">{new Date(act.timestamp).toLocaleDateString()}</span>
            </div>
            <div className="text-xs text-white bg-blue-500 inline-block px-2 rounded mb-2">{act.type}</div>
            <p>{act.details}</p>
            {act.attachmentUrl && (
              <a href={act.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm underline mt-2 block">
                View Attachment
              </a>
            )}
          </div>
        ))}
        {activities.length === 0 && <p className="text-center text-gray-500">No updates found.</p>}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <header className="bg-blue-700 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">EduWhisper Portal</h1>
          {user && <button onClick={() => signOut(auth)} className="bg-blue-800 px-3 py-1 rounded text-sm">Logout</button>}
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
      <div className="mb-6 flex gap-4 justify-center">
        <button onClick={() => setRole('teacher')} className={`px-4 py-2 rounded ${role === 'teacher' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Teacher View</button>
        <button onClick={() => setRole('parent')} className={`px-4 py-2 rounded ${role === 'parent' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Parent View</button>
      </div>
      {role === 'teacher' ? <TeacherDashboard user={user} /> : <ParentDashboard user={user} />}
    </div>
  );
};

export default App;