import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from 'recharts';

// ----------------------------------------------------------------------
// ASSETS & CONFIG
// ----------------------------------------------------------------------
const backgroundUrl = "https://images.unsplash.com/photo-1503919545889-aef6d7a127df?q=80&w=2070&auto=format&fit=crop";
const COLORS = ['#06b6d4', '#3b82f6', '#94A3B8']; // Cyan, Blue, Slate

// ----------------------------------------------------------------------
// SHARED COMPONENTS
// ----------------------------------------------------------------------

const StatCard = ({ title, value, subtext, icon, color }) => (
  <div className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1">
    <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color} text-white`}>
        <span className="text-6xl">{icon}</span>
    </div>
    <div className="flex items-center gap-4 relative z-10">
      <div className={`p-3 rounded-xl ${color} text-white shadow-lg`}>
        <span className="text-xl">{icon}</span>
      </div>
      <div>
        <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</h4>
        <div className="text-2xl font-extrabold text-white mt-1">{value}</div>
        <p className="text-xs text-gray-500 font-medium">{subtext}</p>
      </div>
    </div>
  </div>
);

const SimpleCalendar = ({ activities }) => {
  const [date, setDate] = useState(new Date());
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const hasActivity = (day) => {
    const currentStr = new Date(date.getFullYear(), date.getMonth(), day).toDateString();
    return activities.filter(a => new Date(a.timestamp).toDateString() === currentStr);
  };

  return (
    <div className="w-full bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))} className="p-2 hover:bg-white/10 rounded-lg transition text-cyan-400">←</button>
        <span className="font-bold text-lg tracking-wide">{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))} className="p-2 hover:bg-white/10 rounded-lg transition text-cyan-400">→</button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-500 uppercase mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {blanks.map(b => <div key={`blank-${b}`}></div>)}
        {days.map(d => {
          const acts = hasActivity(d);
          const hasData = acts.length > 0;
          const indicatorColor = acts.some(a => a.type === 'Absent') ? 'bg-red-500' : acts.some(a => a.type === 'Task') ? 'bg-blue-500' : 'bg-green-500';
          return (
            <div key={d} className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all border ${
                hasData ? `bg-white/5 border-${indicatorColor.replace('bg-', '')}/30` : 'hover:bg-white/5 border-transparent text-gray-600'
            }`}>
              <span className={`font-bold ${hasData ? "text-white" : ""}`}>{d}</span>
              {hasData && <div className={`mt-1 w-1.5 h-1.5 rounded-full ${indicatorColor}`}></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SignaturePad = ({ onEnd, onClear }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#cbd5e1'; 
    }
  }, []);

  const getPos = (e) => { const rect = canvasRef.current.getBoundingClientRect(); if (e.touches && e.touches[0]) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }; return { x: e.clientX - rect.left, y: e.clientY - rect.top }; };
  const startDraw = (e) => { setIsDrawing(true); const ctx = canvasRef.current.getContext('2d'); const { x, y } = getPos(e); ctx.beginPath(); ctx.moveTo(x, y); e.preventDefault(); };
  const draw = (e) => { if (!isDrawing) return; const ctx = canvasRef.current.getContext('2d'); const { x, y } = getPos(e); ctx.lineTo(x, y); ctx.stroke(); e.preventDefault(); };
  const endDraw = () => { setIsDrawing(false); if(onEnd) onEnd(); };
  const clear = () => { const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height); if(onClear) onClear(); };
  
  return (
    <div className="relative w-full h-48 rounded-xl bg-white/5 border-2 border-dashed border-white/20 hover:border-cyan-500/50 transition-colors touch-none overflow-hidden">
        <canvas ref={canvasRef} id="sig-canvas" className="w-full h-full cursor-crosshair"
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw} onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
        />
        <button onClick={clear} type="button" className="absolute top-3 right-3 text-xs font-bold text-gray-300 hover:text-white bg-black/40 px-3 py-1 rounded-lg backdrop-blur border border-white/10 transition">
            Clear Pad
        </button>
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function ParentDashboard({ user }) {
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("feed");
  const [activeModal, setActiveModal] = useState(null);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  
  const fetchActivities = async () => {
    if (!user) {
         // Mock data for display purposes if not logged in
         setActivities([
             {id: 1, type: 'Attendance', timestamp: new Date(), details: 'Checked in on time.', isAcknowledged: 1},
             {id: 2, type: 'Task', timestamp: new Date(), details: 'Physics: Thermodynamics Chapter Test', score: 92, subject: 'Science'},
             {id: 3, type: 'Permission Slip', timestamp: new Date(), details: 'Required signature for upcoming field trip to Planetarium.', isAcknowledged: 0},
             {id: 4, type: 'Task', timestamp: new Date(Date.now() - 86400000), details: 'History Essay submission', score: 85, subject: 'History'},
         ]);
         return;
    }
    try {
      const token = await user.getIdToken();
      const res = await axios.get("http://localhost:5001/api/activities", { headers: { Authorization: `Bearer ${token}` } });
      setActivities(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchActivities(); }, [user]);

  // --- SIGNATURE SUBMISSION LOGIC ---
  const handleSignatureSubmit = async () => {
    const canvas = document.getElementById('sig-canvas');
    if (!canvas) return;

    // 1. Capture signature as image data
    const signatureURL = canvas.toDataURL('image/png');

    // 2. Optimistic Update (Update UI immediately)
    setActivities(prevActivities => 
        prevActivities.map(activity => 
            activity.id === selectedActivityId 
            ? { ...activity, isAcknowledged: 1, parentSignature: signatureURL } // Add signature to local state
            : activity
        )
    );

    // 3. Send to Backend (if user exists)
    if (user) {
        try {
            const token = await user.getIdToken();
            await axios.put(`http://localhost:5001/api/activities/${selectedActivityId}/sign`, 
                { signature: signatureURL }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error("Failed to save signature", err);
            alert("Error saving signature to server, but updated locally.");
        }
    }

    // 4. Close Modal
    setActiveModal(null);
  };

  // --- ANALYTICS CALCULATIONS ---
  const attendanceData = useMemo(() => {
    const present = activities.filter(a => a.type === 'Attendance').length;
    const absent = activities.filter(a => a.type === 'Absent').length;
    return (present === 0 && absent === 0) ? [{ name: 'No Data', value: 1 }] : [{ name: 'Present', value: present }, { name: 'Absent', value: absent }];
  }, [activities]);

  const gradeData = useMemo(() => {
    return activities.filter(a => a.type === 'Task' && a.score != null)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(a => ({ name: new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), score: a.score }));
  }, [activities]);

  const stats = useMemo(() => {
    if (activities.length === 0) return { name: "Student", gradeLevel: "N/A" };
    return { name: activities[0].studentName || "Alex Doe", gradeLevel: activities[0].grade || "12th Grade" };
  }, [activities]);

  const avgScore = gradeData.length > 0 ? Math.round(gradeData.reduce((a,b) => a + b.score, 0) / gradeData.length) : 0;

  return (
    <div className="relative min-h-screen font-sans bg-gray-900 overflow-x-hidden selection:bg-cyan-500/30 text-white">
      
      {/* 1. BACKGROUND LAYERS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-indigo-900/70 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="relative z-10 p-4 md:p-8">
        
        {/* HEADER */}
        <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-end pb-6 border-b border-white/10">
          <div className="flex items-center gap-5">
              <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-75 animate-pulse"></div>
                  <div className="relative bg-slate-900 p-3 rounded-full border border-white/10">
                     <span className="text-2xl">👨‍👩‍👧</span>
                  </div>
              </div>
              <div>
                  <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
                    Parent<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Portal</span>
                  </h1>
                  <div className="flex items-center gap-2 text-sm font-medium tracking-wide text-blue-200 mt-1">
                     <span className="text-gray-400">Viewing Profile:</span>
                     <span className="text-cyan-400 font-bold">{stats.name}</span>
                  </div>
              </div>
          </div>
          
          <div className="flex gap-4 mt-4 md:mt-0">
             <div className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-lg">
                📅 {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
             </div>
          </div>
        </header>

        {/* 3. STATS GRID */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
           <StatCard title="Overall Grade" value={`${avgScore}%`} subtext="Top 10% of class" icon="📊" color="bg-blue-600" />
           <StatCard title="Attendance" value="98%" subtext="Present 42/43 days" icon="📅" color="bg-green-600" />
           <StatCard title="New Activities" value={activities.length} subtext="Updated today" icon="🔔" color="bg-purple-600" />
           <StatCard title="Pending Action" value={activities.filter(a => !a.isAcknowledged).length} subtext="Requires signature" icon="⚠️" color="bg-orange-600" />
        </div>

        {/* 4. MAIN WORKSPACE GRID */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT CONTENT (Span 8) */}
          <div className="lg:col-span-8">
            <div className="bg-white/5 backdrop-blur-xl p-1 rounded-3xl shadow-2xl border border-white/10 min-h-[600px]">
                
                {/* Tab Switcher */}
                <div className="flex p-2 bg-black/20 rounded-2xl mb-6 border border-white/5">
                    {['feed', 'calendar', 'analytics'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-300 ${
                                activeTab === tab 
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="px-6 pb-6">
                    
                    {/* FEED TAB */}
                    {activeTab === 'feed' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activities.map((act) => (
                                <div key={act.id} className="group relative bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-5 transition-all duration-300">
                                    <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-lg ${act.isAcknowledged ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                                    <div className="flex justify-between items-start pl-4">
                                        <div className="flex gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-black/30 flex items-center justify-center border border-white/10 text-2xl shadow-inner">
                                                {act.type === 'Attendance' ? '✅' : act.type === 'Task' ? '📚' : act.type === 'Permission Slip' ? '📝' : '📌'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                                    {act.type}
                                                    {!act.isAcknowledged && act.type === 'Permission Slip' && (
                                                        <span className="text-[10px] uppercase bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded">Action Required</span>
                                                    )}
                                                </h3>
                                                <p className="text-gray-400 text-xs">{new Date(act.timestamp).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        {act.score && (
                                            <div className="flex flex-col items-end">
                                                <span className="text-2xl font-black text-white">{act.score}%</span>
                                                <span className="text-xs text-cyan-400">Score</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 pl-16">
                                        <div className="bg-black/20 rounded-xl p-4 text-gray-300 text-sm border border-white/5 leading-relaxed">
                                            {act.details}
                                        </div>
                                        {/* Action Buttons */}
                                        <div className="mt-4 flex gap-3">
                                            {/* Logic: Show "Sign" button if NOT acknowledged yet */}
                                            {act.type === 'Permission Slip' && !act.isAcknowledged && (
                                                <button 
                                                    onClick={() => { setSelectedActivityId(act.id); setActiveModal('sign'); }} 
                                                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-900/30 transition-all flex items-center gap-2 active:scale-95"
                                                >
                                                    <span>✍️</span> Sign Permission Slip
                                                </button>
                                            )}
                                            
                                            {/* Logic: Show "Signed" badge if signature exists in state */}
                                            {act.parentSignature && (
                                                <div className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-bold flex items-center gap-2">
                                                    <span>✓ Signed Digitally</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* (Other tabs remain the same...) */}
                    {activeTab === 'calendar' && (
                         <div className="animate-in fade-in zoom-in duration-300">
                             <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
                                Attendance Record
                             </h3>
                             <SimpleCalendar activities={activities} />
                             <div className="flex gap-6 mt-4 text-xs font-bold text-gray-400 justify-center bg-black/20 p-2 rounded-xl border border-white/5">
                                 <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Present</div>
                                 <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Absent</div>
                                 <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Task/Event</div>
                             </div>
                         </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                <h4 className="text-gray-300 text-sm font-bold uppercase mb-6 flex items-center gap-2">
                                     <span className="text-xl">📈</span> Academic Performance Trend
                                </h4>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={gradeData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                                            <Tooltip 
                                                contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'}}
                                                itemStyle={{color: '#22d3ee'}}
                                                cursor={{stroke: '#334155', strokeWidth: 1}}
                                            />
                                            <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={4} dot={{r: 6, fill: '#0ea5e9', strokeWidth: 3, stroke: '#0f172a'}} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            
                            <div className="bg-black/20 p-6 rounded-2xl border border-white/5 flex flex-col items-center">
                                <h4 className="text-gray-300 text-sm font-bold uppercase mb-4 w-full text-left flex items-center gap-2">
                                    <span className="text-xl">📉</span> Attendance Ratio
                                </h4>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                                                {attendanceData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                            </Pie>
                                            <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-gray-300 font-bold">{value}</span>} iconType="circle"/>
                                            <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff'}} itemStyle={{color: '#fff'}}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* RIGHT: WIDGETS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-white/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <h3 className="font-bold mb-4 relative z-10 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> System Alerts
                </h3>
                <div className="space-y-3 relative z-10">
                    <div className="flex gap-3 items-start bg-white/5 hover:bg-white/10 transition p-3 rounded-xl border border-white/5">
                        <div className="mt-0.5 text-yellow-400 bg-yellow-400/10 p-1.5 rounded-lg">⚠️</div>
                        <div><p className="font-bold text-sm">Unsigned Permission Slip</p><p className="text-gray-400 text-xs">Due: Tomorrow</p></div>
                    </div>
                    <div className="flex gap-3 items-start bg-white/5 hover:bg-white/10 transition p-3 rounded-xl border border-white/5">
                        <div className="mt-0.5 text-blue-400 bg-blue-400/10 p-1.5 rounded-lg">ℹ️</div>
                        <div><p className="font-bold text-sm">School Fair</p><p className="text-gray-400 text-xs">Saturday, 10:00 AM</p></div>
                    </div>
                </div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-xl">
                <h3 className="font-bold text-gray-200 mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    School Information
                </h3>
                <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-3 text-gray-300"><div className="bg-white/10 p-2 rounded-lg">📞</div><div><p className="font-bold text-white">Main Office</p><p className="text-xs">(555) 123-4567</p></div></div>
                    <div className="flex items-center gap-3 text-gray-300"><div className="bg-white/10 p-2 rounded-lg">📧</div><div><p className="font-bold text-white">Email</p><p className="text-xs">contact@eduwhisper.local</p></div></div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* SIGNATURE MODAL */}
      {activeModal === 'sign' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveModal(null)}></div>
          <div className="bg-slate-900 rounded-[2rem] shadow-2xl p-8 w-full max-w-lg relative border border-white/20 animate-in fade-in zoom-in duration-200">
             <h2 className="text-2xl font-black text-white mb-2">Authorize Activity</h2>
             <p className="text-gray-400 font-medium mb-6 text-sm">By signing below, you acknowledge and grant permission for this activity.</p>
             <SignaturePad />
             <div className="flex gap-4 mt-6">
               <button onClick={() => setActiveModal(null)} className="flex-1 py-3 text-gray-400 font-bold bg-white/5 rounded-xl hover:bg-white/10 transition border border-white/5 hover:text-white">Cancel</button>
               <button onClick={handleSignatureSubmit} className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition transform hover:-translate-y-0.5 active:scale-95">Confirm Signature</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}