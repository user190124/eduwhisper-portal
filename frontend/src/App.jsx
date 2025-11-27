import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithCustomToken, 
  signInAnonymously, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  LogOut, 
  School, 
  User, 
  BookOpen, 
  MessageSquare, 
  TrendingUp,
  Shield,
  Menu,
  X
} from 'lucide-react';

// --- Firebase Initialization ---
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
// Fallback if config is empty (prevents crash, though auth won't work without real config)
const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Sub-Components (Defined BEFORE App to prevent build errors) ---

const Login = () => {
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!auth) {
      setError("Firebase not configured.");
      return;
    }
    setIsLoggingIn(true);
    try {
      // Try anonymous login for demo purposes if no Google provider setup
      await signInAnonymously(auth);
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to sign in. " + err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <School className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to EduWhisper</h2>
        <p className="text-gray-500 mb-8">Connect with your school community securely.</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <button 
          onClick={handleLogin} 
          disabled={isLoggingIn}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          {isLoggingIn ? 'Signing in...' : 'Sign In as Guest'}
        </button>
        <p className="mt-4 text-xs text-gray-400">
          Demo Mode: No password required.
        </p>
      </div>
    </div>
  );
};

const TeacherDashboard = ({ user }) => {
  const [students, setStudents] = useState([
    { id: 1, name: 'Alex Johnson', grade: 'A', attendance: '95%' },
    { id: 2, name: 'Sam Smith', grade: 'B+', attendance: '88%' },
    { id: 3, name: 'Jordan Lee', grade: 'A-', attendance: '92%' },
  ]);

  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Classroom Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Students</p>
            <p className="text-2xl font-bold text-blue-700">24</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Avg. Attendance</p>
            <p className="text-2xl font-bold text-green-700">92%</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Assignments Due</p>
            <p className="text-2xl font-bold text-purple-700">3</p>
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-700 mb-3">Recent Student Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-800 font-medium">
              <tr>
                <th className="p-3 rounded-l-md">Student Name</th>
                <th className="p-3">Current Grade</th>
                <th className="p-3 rounded-r-md">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-3">{student.name}</td>
                  <td className="p-3">
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                      {student.grade}
                    </span>
                  </td>
                  <td className="p-3">{student.attendance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ParentDashboard = ({ user }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-green-600" />
          My Child's Progress
        </h2>
        
        <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-lg font-bold text-green-600">
            JL
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Jordan Lee</h3>
            <p className="text-sm text-gray-500">Grade 5 • Room 302</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-100 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Recent Grades
            </h4>
            <ul className="space-y-3">
              <li className="flex justify-between items-center text-sm">
                <span>Mathematics Quiz</span>
                <span className="font-bold text-gray-800">92/100</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span>Science Project</span>
                <span className="font-bold text-gray-800">A-</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span>History Essay</span>
                <span className="font-bold text-gray-800">88/100</span>
              </li>
            </ul>
          </div>

          <div className="border border-gray-100 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-orange-500" />
              Teacher Notes
            </h4>
            <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800">
              "Jordan has been showing great improvement in group activities this week!"
              <div className="text-xs text-yellow-600 mt-1 text-right">- Mrs. Anderson, 2 days ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardRouter = ({ user }) => {
  const [role, setRole] = useState('teacher');
  
  return (
    <div className="w-full">
      {/* Role Switcher */}
      <div className="max-w-md mx-auto mb-8 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 flex">
        <button 
          onClick={() => setRole('teacher')} 
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            role === 'teacher' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Teacher View
        </button>
        <button 
          onClick={() => setRole('parent')} 
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            role === 'parent' 
              ? 'bg-green-600 text-white shadow-md' 
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Parent View
        </button>
      </div>

      {/* Content Area */}
      {role === 'teacher' ? <TeacherDashboard user={user} /> : <ParentDashboard user={user} />}
    </div>
  );
};

// --- Main App Component ---

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Correct Auth Initialization for this environment
    const initAuth = async () => {
      if (!auth) {
        setLoading(false);
        return;
      }
      
      // If a custom token is provided by the environment, use it
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try {
          await signInWithCustomToken(auth, __initial_auth_token);
        } catch (e) {
          console.error("Auth token failed", e);
        }
      }
      
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
      return unsubscribe;
    };

    initAuth();
  }, []);

  const handleLogout = async () => {
    if (auth) await signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Determine current view based on auth state
  // We use a simple conditional render here instead of full Router for the single-file setup,
  // but it mimics the routing logic you provided.
  const CurrentView = user ? DashboardRouter : Login;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <School className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
              EduWhisper Portal
            </h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:block">
                {user.email || 'Guest User'}
              </span>
              <button 
                onClick={handleLogout} 
                className="text-sm bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6">
        {/* Pass user prop to the current view */}
        <CurrentView user={user} />
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-400">
        <p>&copy; {new Date().getFullYear()} EduWhisper Inc. Secure Portal.</p>
      </footer>
    </div>
  );
}

export default App;