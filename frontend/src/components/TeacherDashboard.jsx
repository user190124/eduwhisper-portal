import React, { useState } from 'react';
import axios from 'axios';

// ----------------------------------------------------------------------
// CONFIGURATION
// ----------------------------------------------------------------------
const backgroundUrl = "https://images.unsplash.com/photo-1503919545889-aef6d7a127df?q=80&w=2070&auto=format&fit=crop";

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

const ScheduleItem = ({ time, subject, grade, status }) => (
  <div className="flex items-center gap-4 p-3 hover:bg-white/50 rounded-xl transition-colors border-b border-gray-100 last:border-0">
    <div className="text-center min-w-[50px]">
      <p className="text-xs font-bold text-gray-400">{time.split(' ')[0]}</p>
      <p className="text-xs font-bold text-indigo-600">{time.split(' ')[1]}</p>
    </div>
    <div className="flex-1">
      <h5 className="font-bold text-gray-800 text-sm">{subject}</h5>
      <p className="text-xs text-gray-500">{grade}</p>
    </div>
    <div>
      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
        status === 'Live' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500'
      }`}>
        {status}
      </span>
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
  const [activityForm, setActivityForm] = useState({
    studentName: "", grade: "", subject: "", type: "Attendance", details: "", score: "", file: null,
  });

  const submitActivity = async (e) => {
    e.preventDefault();
    setStatus("Submitting...");
    
    try {
        const token = await user.getIdToken();
        const formData = new FormData();
        formData.append("studentName", activityForm.studentName);
        formData.append("grade", activityForm.grade || "N/A");
        formData.append("subject", activityForm.subject);
        formData.append("type", activityForm.type);
        formData.append("details", activityForm.details || "File Uploaded");
  
        if (activityForm.score) formData.append("score", activityForm.score);
        if (activityForm.file) formData.append("file", activityForm.file);
  
        await axios.post("http://localhost:5001/api/activities", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setStatus("Success: Entry Logged");
        setActivityForm({ ...activityForm, studentName: "", details: "", score: "", file: null });
        setTimeout(() => setStatus(""), 3000);

    } catch (err) {
        console.error(err);
        setStatus("Error: Check console");
    }
  };

  return (
    <div className="relative min-h-screen font-sans bg-gray-100 overflow-x-hidden selection:bg-indigo-200">
      
      {/* 1. BACKGROUND LAYERS */}
      <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-indigo-900/60 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="relative z-10 p-4 md:p-8">
        
        {/* HEADER */}
        <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-end pb-6 border-b border-white/10">
          <div className="flex items-center gap-5">
              <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-75 animate-pulse"></div>
                  <div className="relative bg-slate-900 p-3 rounded-full border border-white/10">
                     <span className="text-2xl">🎓</span>
                  </div>
              </div>
              <div>
                  <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
                    Edu<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Whisper</span>
                  </h1>
                  <p className="text-blue-200 text-sm font-medium tracking-wide">Instructor Portal v2.0</p>
              </div>
          </div>
          
          <div className="flex gap-4 mt-4 md:mt-0">
             <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-lg">
                <Icons.Calendar /> {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
             </div>
          </div>
        </header>

        {/* 3. STATS GRID */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
           <StatCard title="Total Students" value="142" subtext="+3 this week" icon={Icons.Student} color="bg-blue-500" />
           <StatCard title="Avg Attendance" value="94%" subtext="↑ 2% vs last month" icon={Icons.Trending} color="bg-green-500" />
           <StatCard title="Pending Grading" value="18" subtext="4 urgent items" icon={Icons.Task} color="bg-orange-500" />
           <StatCard title="Class Hours" value="24h" subtext="Completed this week" icon={Icons.Clock} color="bg-purple-500" />
        </div>

        {/* 4. MAIN WORKSPACE GRID */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: ACTION FORM (Span 8) */}
          <div className="lg:col-span-8">
            <div className="bg-white/80 backdrop-blur-xl p-1 rounded-3xl shadow-2xl border border-white/40">
                
                {/* Custom Tab Switcher */}
                <div className="flex p-2 bg-gray-100/50 rounded-2xl mb-6">
                    {['activity', 'file'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-300 ${
                                activeTab === tab 
                                ? 'bg-white text-indigo-600 shadow-md transform scale-[1.02]' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab === 'activity' ? 'Log Activity' : 'Upload Resource'}
                        </button>
                    ))}
                </div>

                {/* The Form */}
                <div className="px-8 pb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                        {activeTab === 'activity' ? 'New Student Entry' : 'Upload Materials'}
                    </h2>
                    
                    <form onSubmit={submitActivity} className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="group">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Student</label>
                                <input 
                                    className="w-full bg-white/50 border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 outline-none transition-all font-semibold text-gray-700"
                                    placeholder="Search student..."
                                    value={activityForm.studentName}
                                    onChange={e => setActivityForm({...activityForm, studentName: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Subject / Type</label>
                                <select 
                                    className="w-full bg-white/50 border border-gray-200 focus:border-indigo-500 rounded-xl px-4 py-3 outline-none transition-all font-semibold text-gray-700 appearance-none"
                                    value={activityForm.subject}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setActivityForm({
                                            ...activityForm, 
                                            subject: val,
                                            // Automatically set type to 'Permission Slip' if chosen, else default to Task/Attendance
                                            type: val === 'Permission Slip' ? 'Permission Slip' : (activeTab === 'file' ? 'File Upload' : 'Task')
                                        });
                                    }}
                                >
                                    <option value="" disabled>Select Subject</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="Science">Science</option>
                                    <option value="History">History</option>
                                    <option value="Literature">Literature</option>
                                    {/* Added Permission Slip option as requested */}
                                    <option value="Permission Slip" className="font-bold text-indigo-600">Permission Slip</option>
                                </select>
                            </div>
                        </div>

                        {/* --- CONDITIONAL: ACTIVITY BUTTONS & TEXTAREA --- */}
                        {activeTab === 'activity' && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

                                <div className="relative">
                                    <textarea 
                                        className="w-full bg-white/50 border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 h-32 outline-none transition-all resize-none"
                                        placeholder="Add detailed notes here..."
                                        value={activityForm.details}
                                        onChange={e => setActivityForm({...activityForm, details: e.target.value})}
                                    ></textarea>
                                    <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-bold">MARKDOWN SUPPORTED</div>
                                </div>
                            </div>
                        )}

                        {/* --- CONDITIONAL: FILE UPLOAD DROPZONE --- */}
                        {activeTab === 'file' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="relative border-2 border-dashed border-indigo-300/50 bg-indigo-50/30 rounded-2xl p-10 text-center hover:bg-indigo-50/60 transition-all group cursor-pointer">
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={(e) => setActivityForm({ ...activityForm, file: e.target.files[0] })}
                                    />
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="p-4 bg-white rounded-full shadow-lg text-indigo-500 group-hover:scale-110 transition-transform">
                                            <Icons.Upload s={8} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-gray-700">Click or Drag to Upload</p>
                                            <p className="text-sm text-gray-500">PDF, DOCX, JPG (Max 10MB)</p>
                                        </div>
                                        {activityForm.file && (
                                            <div className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold shadow-sm">
                                                Selected: {activityForm.file.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Futuristic Button */}
                        <button className="w-full group relative py-4 rounded-xl overflow-hidden font-bold text-white shadow-xl transform active:scale-[0.99] transition-all">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-[gradient_3s_ease_infinite]"></div>
                            <span className="relative flex justify-center items-center gap-2">
                                {activeTab === 'activity' ? 'Save to Database' : 'Start File Upload'} 
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </span>
                        </button>
                    </form>
                    
                    {status && (
                        <div className={`mt-4 p-3 rounded-lg text-center font-bold text-sm animate-bounce ${status.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {status}
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* RIGHT: RELEVANT INFO SIDEBAR (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Widget 1: Schedule */}
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 border border-white/50 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800">Today's Schedule</h3>
                    <button className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
                </div>
                <div className="space-y-2">
                    <ScheduleItem time="08:30 AM" subject="Calculus II" grade="12th Grade" status="Done" />
                    <ScheduleItem time="10:00 AM" subject="Physics Lab" grade="11th Grade" status="Live" />
                    <ScheduleItem time="01:00 PM" subject="Office Hours" grade="Staff Room" status="Upcoming" />
                </div>
            </div>

            {/* Widget 2: Recent Alerts */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                
                <h3 className="font-bold mb-4 relative z-10 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    System Alerts
                </h3>
                <div className="space-y-4 relative z-10 text-sm">
                    <div className="flex gap-3 items-start bg-white/10 p-3 rounded-xl border border-white/5">
                        <div className="mt-1 text-yellow-400">⚠️</div>
                        <div>
                            <p className="font-bold">Grade Submission</p>
                            <p className="text-gray-300 text-xs">Term 2 grades close in 48 hours.</p>
                        </div>
                    </div>
                    <div className="flex gap-3 items-start bg-white/10 p-3 rounded-xl border border-white/5">
                        <div className="mt-1 text-blue-400">ℹ️</div>
                        <div>
                            <p className="font-bold">Staff Meeting</p>
                            <p className="text-gray-300 text-xs">Friday at 3:00 PM in Main Hall.</p>
                        </div>
                    </div>
                </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}