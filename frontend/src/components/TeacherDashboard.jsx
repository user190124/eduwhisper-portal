import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ----------------------------------------------------------------------
// CONFIGURATION & MOCK DATA
// ----------------------------------------------------------------------
const backgroundUrl = "https://images.unsplash.com/photo-1503919545889-aef6d7a127df?q=80&w=2070&auto=format&fit=crop";

const STUDENTS = [
  { id: 1, name: 'Alice Johnson', grade: '12th Grade' },
  { id: 2, name: 'Bob Smith', grade: '12th Grade' },
  { id: 3, name: 'Charlie Brown', grade: '11th Grade' },
  { id: 4, name: 'Diana Prince', grade: '11th Grade' },
  { id: 5, name: 'Evan Wright', grade: '10th Grade' },
];

// ----------------------------------------------------------------------
// COMPONENTS
// ----------------------------------------------------------------------

const StatCard = ({ title, value, subtext, icon, color }) => (
  <div className="group relative overflow-hidden bg-white/60 backdrop-blur-md border border-white/50 p-5 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
    <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
        {icon(12)} 
    </div>
    <div className="flex items-center gap-4 relative z-10">
      <div className={`p-3 rounded-xl ${color} text-white shadow-lg`}>
        {icon(6)}
      </div>
      <div>
        <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h4>
        <div className="text-2xl font-extrabold text-gray-800">{value}</div>
        <p className="text-xs text-gray-500 font-medium">{subtext}</p>
      </div>
    </div>
  </div>
);

const Icons = {
  Student: (s=6) => <svg className={`w-${s} h-${s}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Task: (s=6) => <svg className={`w-${s} h-${s}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  Clock: (s=6) => <svg className={`w-${s} h-${s}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Trending: (s=6) => <svg className={`w-${s} h-${s}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  Calendar: () => <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Upload: (s=6) => <svg className={`w-${s} h-${s}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
};

export default function TeacherDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("activity"); 
  const [status, setStatus] = useState("");
  const [history, setHistory] = useState([]);
  
  // NEW: Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  // NEW: Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form State
  const [activityForm, setActivityForm] = useState({
    studentId: "", studentName: "", grade: "", subject: "", type: "Attendance", details: "", score: "", maxPoints: "", dueDate: "", file: null,
  });

  const [attendanceMap, setAttendanceMap] = useState({}); 

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
        const token = await user?.getIdToken() || "mock_token";
        const res = await axios.get("http://localhost:5001/api/activities", {
             headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data);
    } catch (err) {
        console.error("Fetch history failed", err);
    }
  };

  // --- Handlers ---

  const handleStudentSelect = (e) => {
      const sId = parseInt(e.target.value);
      const student = STUDENTS.find(s => s.id === sId);
      if(student) {
          setActivityForm({ ...activityForm, studentId: sId, studentName: student.name, grade: student.grade });
      }
  };

  // Feature: Populate Form for Editing
  const handleEdit = (log) => {
      // Find student ID based on name to set the dropdown correctly
      const student = STUDENTS.find(s => s.name === log.studentName);
      setActivityForm({
          studentId: student ? student.id : "",
          studentName: log.studentName,
          grade: log.grade,
          subject: log.subject || "",
          type: log.type,
          details: log.details,
          score: log.score || "",
          maxPoints: log.maxPoints || "",
          dueDate: log.dueDate || "",
          file: null // We don't preload the file object, user must re-upload if they want to change it
      });
      setIsEditing(true);
      setEditId(log.id);
      setActiveTab("activity"); // Switch to form tab
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
  };

  // Feature: Cancel Edit
  const handleCancelEdit = () => {
      setIsEditing(false);
      setEditId(null);
      setActivityForm({
        studentId: "", studentName: "", grade: "", subject: "", type: "Attendance", details: "", score: "", maxPoints: "", dueDate: "", file: null,
      });
  };

  const deleteLog = async (id) => {
      if(!window.confirm("Are you sure you want to delete this log?")) return;
      try {
        const token = await user?.getIdToken() || "mock_token";
        await axios.delete(`http://localhost:5001/api/activities/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchHistory();
      } catch (err) {
          console.error(err);
      }
  };

  // Create OR Update Activity
  const submitActivity = async (e) => {
    e.preventDefault();
    setStatus(isEditing ? "Updating..." : "Submitting...");
    
    try {
        const token = await user?.getIdToken() || "mock_token";
        const formData = new FormData();
        formData.append("studentName", activityForm.studentName);
        formData.append("grade", activityForm.grade || "N/A");
        formData.append("subject", activityForm.subject);
        formData.append("type", activityForm.type);
        formData.append("details", activityForm.details || "");
  
        if (activityForm.score) formData.append("score", activityForm.score);
        if (activityForm.maxPoints) formData.append("maxPoints", activityForm.maxPoints);
        if (activityForm.dueDate) formData.append("dueDate", activityForm.dueDate);
        if (activityForm.file) formData.append("file", activityForm.file);
  
        if (isEditing) {
            // PUT Request
            await axios.put(`http://localhost:5001/api/activities/${editId}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStatus("Success: Entry Updated");
            handleCancelEdit(); // Reset mode
        } else {
            // POST Request
            await axios.post("http://localhost:5001/api/activities", formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStatus("Success: Entry Logged");
            setActivityForm({ ...activityForm, details: "", score: "", maxPoints: "", dueDate: "", file: null });
        }
        
        fetchHistory();
        setTimeout(() => setStatus(""), 3000);

    } catch (err) {
        console.error(err);
        setStatus("Error: Check console");
    }
  };

  const submitRollCall = async () => {
    setStatus("Submitting Roll Call...");
    const records = STUDENTS.map(s => ({
        studentName: s.name,
        grade: s.grade,
        details: attendanceMap[s.id] ? "Present" : "Absent"
    }));

    try {
        const token = await user?.getIdToken() || "mock_token";
        await axios.post("http://localhost:5001/api/activities/bulk", records, {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        });
        setStatus("Roll Call Saved!");
        setAttendanceMap({});
        fetchHistory();
        setTimeout(() => setStatus(""), 3000);
    } catch (err) {
        setStatus("Error submitting Roll Call");
    }
  };

  // --- Filter Logic ---
  const filteredHistory = history.filter(item => {
      const matchesSearch = item.studentName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "All" || item.type === filterType;
      return matchesSearch && matchesType;
  });

  return (
    <div className="relative min-h-screen font-sans bg-gray-100 overflow-x-hidden selection:bg-indigo-200">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-indigo-900/60 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 p-4 md:p-8">
        
        <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-end pb-6 border-b border-white/10">
          <div className="flex items-center gap-5">
              <div className="relative bg-slate-900 p-3 rounded-full border border-white/10">
                  <span className="text-2xl">🎓</span>
              </div>
              <div>
                  <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
                    Edu<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Whisper</span>
                  </h1>
                  <p className="text-blue-200 text-sm font-medium tracking-wide">Instructor Portal v2.2</p>
              </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
           <StatCard title="Total Students" value={STUDENTS.length} subtext="Active Roster" icon={Icons.Student} color="bg-blue-500" />
           <StatCard title="Total Logs" value={history.length} subtext="All time entries" icon={Icons.Trending} color="bg-green-500" />
           <StatCard title="Assignments" value={history.filter(h => h.type === 'Task').length} subtext="Pending review" icon={Icons.Task} color="bg-orange-500" />
           <StatCard title="Class Hours" value="24h" subtext="Completed this week" icon={Icons.Clock} color="bg-purple-500" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8">
            <div className="bg-white/80 backdrop-blur-xl p-1 rounded-3xl shadow-2xl border border-white/40">
                
                {/* Tab Switcher */}
                <div className="flex p-2 bg-gray-100/50 rounded-2xl mb-6">
                    {['activity', 'rollcall', 'file'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-300 ${
                                activeTab === tab 
                                ? 'bg-white text-indigo-600 shadow-md transform scale-[1.02]' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab === 'activity' ? (isEditing ? '✏️ Editing Mode' : 'Individual') : tab === 'rollcall' ? 'Roll Call' : 'Resources'}
                        </button>
                    ))}
                </div>

                {/* --- TAB: INDIVIDUAL (CREATE / EDIT) --- */}
                {activeTab === 'activity' && (
                    <div className="px-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {isEditing && (
                            <div className="mb-4 bg-yellow-100 text-yellow-800 p-3 rounded-xl flex justify-between items-center">
                                <span className="font-bold text-sm">⚠️ You are editing an existing entry.</span>
                                <button onClick={handleCancelEdit} className="text-xs underline font-bold">Cancel Edit</button>
                            </div>
                        )}

                        <form onSubmit={submitActivity} className="space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="group">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Student</label>
                                    <select 
                                        className="w-full bg-white/50 border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 outline-none transition-all font-semibold text-gray-700"
                                        value={activityForm.studentId}
                                        onChange={handleStudentSelect}
                                        required
                                    >
                                        <option value="">Select Student...</option>
                                        {STUDENTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Subject</label>
                                    <select 
                                        className="w-full bg-white/50 border border-gray-200 focus:border-indigo-500 rounded-xl px-4 py-3 outline-none transition-all font-semibold text-gray-700"
                                        value={activityForm.subject}
                                        onChange={(e) => setActivityForm({...activityForm, subject: e.target.value})}
                                    >
                                        <option value="" disabled>Select Subject</option>
                                        <option value="Mathematics">Mathematics</option>
                                        <option value="Science">Science</option>
                                        <option value="History">History</option>
                                        <option value="Literature">Literature</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {['Attendance', 'Task', 'Behavior'].map(type => (
                                    <button 
                                        type="button"
                                        key={type}
                                        onClick={() => setActivityForm({...activityForm, type})}
                                        className={`py-2 rounded-lg text-sm font-bold border transition-all ${
                                            activityForm.type === type 
                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            {activityForm.type === 'Task' && (
                                <div className="grid grid-cols-2 gap-5 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                    <div>
                                        <label className="block text-xs font-bold text-indigo-500 uppercase mb-1">Max Points</label>
                                        <input type="number" className="w-full p-2 rounded-lg border border-gray-200" value={activityForm.maxPoints} onChange={e => setActivityForm({...activityForm, maxPoints: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-indigo-500 uppercase mb-1">Due Date</label>
                                        <input type="date" className="w-full p-2 rounded-lg border border-gray-200" value={activityForm.dueDate} onChange={e => setActivityForm({...activityForm, dueDate: e.target.value})} />
                                    </div>
                                </div>
                            )}

                            <textarea 
                                className="w-full bg-white/50 border border-gray-200 focus:border-indigo-500 rounded-xl px-4 py-3 h-24 outline-none resize-none"
                                placeholder="Notes or Description..."
                                value={activityForm.details}
                                onChange={e => setActivityForm({...activityForm, details: e.target.value})}
                            ></textarea>

                            <button className={`w-full py-4 rounded-xl text-white font-bold shadow-xl transition-all ${isEditing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                {isEditing ? "Update Entry" : "Log Entry"}
                            </button>
                        </form>
                    </div>
                )}

                {/* --- TAB: ROLL CALL --- */}
                {activeTab === 'rollcall' && (
                    <div className="px-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-2 max-h-[400px] overflow-y-auto mb-4">
                            {STUDENTS.map(student => (
                                <div key={student.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-xs">
                                            {student.name.charAt(0)}
                                        </div>
                                        <p className="font-bold text-gray-800 text-sm">{student.name}</p>
                                    </div>
                                    <button 
                                        onClick={() => setAttendanceMap(prev => ({ ...prev, [student.id]: !prev[student.id] }))}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                            attendanceMap[student.id] 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-red-100 text-red-700'
                                        }`}
                                    >
                                        {attendanceMap[student.id] ? 'PRESENT' : 'ABSENT'}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={submitRollCall} className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-xl">
                            Submit Roll Call
                        </button>
                    </div>
                )}

                 {/* --- TAB: FILE UPLOAD --- */}
                 {activeTab === 'file' && (
                    <div className="px-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                         <div className="relative border-2 border-dashed border-indigo-300/50 bg-indigo-50/30 rounded-2xl p-10 text-center hover:bg-indigo-50/60 transition-all group cursor-pointer">
                            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => setActivityForm({ ...activityForm, file: e.target.files[0], type: 'File Upload' })} />
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="p-4 bg-white rounded-full shadow-lg text-indigo-500"><Icons.Upload s={8} /></div>
                                <p className="text-lg font-bold text-gray-700">Upload Resource</p>
                                {activityForm.file && <span className="text-green-600 font-bold">{activityForm.file.name}</span>}
                            </div>
                        </div>
                        <button onClick={submitActivity} className="w-full mt-4 py-4 rounded-xl bg-indigo-600 text-white font-bold shadow-xl">Upload File</button>
                    </div>
                 )}

                {status && <div className="text-center p-2 font-bold text-indigo-600">{status}</div>}
            </div>

            {/* --- RECENT HISTORY W/ SEARCH & EDIT --- */}
            <div className="mt-8 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/40">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800 text-lg">📝 Activity Log</h3>
                    
                    {/* NEW: SEARCH & FILTER BAR */}
                    <div className="flex gap-2 mt-4 md:mt-0 w-full md:w-auto">
                        <input 
                            type="text" 
                            placeholder="Search Student..." 
                            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select 
                            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="All">All Types</option>
                            <option value="Attendance">Attendance</option>
                            <option value="Task">Task</option>
                            <option value="Behavior">Behavior</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white/90 backdrop-blur-sm z-10">
                            <tr className="text-xs font-bold text-gray-400 uppercase border-b border-gray-200">
                                <th className="p-3">Student</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Details</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {filteredHistory.map(log => (
                                <tr key={log.id} className="border-b border-gray-100 last:border-0 hover:bg-white/50">
                                    <td className="p-3 font-bold text-gray-700">{log.studentName}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                            log.type === 'Attendance' ? 'bg-purple-100 text-purple-600' :
                                            log.type === 'Task' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                        }`}>{log.type}</span>
                                    </td>
                                    <td className="p-3 text-gray-500">
                                        {log.details}
                                        {log.maxPoints && <div className="text-xs text-indigo-500">Max: {log.maxPoints} | Due: {log.dueDate}</div>}
                                    </td>
                                    <td className="p-3 text-right">
                                        {/* EDIT BUTTON */}
                                        <button 
                                            onClick={() => handleEdit(log)} 
                                            className="text-indigo-400 hover:text-indigo-600 font-bold px-2 mr-2"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        {/* DELETE BUTTON */}
                                        <button 
                                            onClick={() => deleteLog(log.id)} 
                                            className="text-red-400 hover:text-red-600 font-bold px-2"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredHistory.length === 0 && <p className="text-center text-gray-400 py-4">No logs match your filter.</p>}
                </div>
            </div>

          </div>

          {/* RIGHT: WIDGETS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 border border-white/50 shadow-xl">
                <h3 className="font-bold text-gray-800 mb-4">Class Schedule</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm"><span className="font-bold text-gray-500">08:30 AM</span> <span className="font-bold text-indigo-600">Calculus II</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="font-bold text-gray-500">10:00 AM</span> <span className="font-bold text-indigo-600">Physics Lab</span></div>
                </div>
            </div>
             <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl">
                <h3 className="font-bold mb-2">📢 System Alerts</h3>
                <p className="text-sm text-gray-300">Grade submissions for Term 2 are closing in 48 hours.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}