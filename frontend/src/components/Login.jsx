import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

// ----------------------------------------------------------------------
// ASSETS & CONFIG
// ----------------------------------------------------------------------
const backgroundUrl = "https://images.unsplash.com/photo-1503919545889-aef6d7a127df?q=80&w=2070&auto=format&fit=crop";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
    } catch (err) {
      setError('Login failed. Check credentials.');
      console.error(err);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center font-sans overflow-hidden selection:bg-cyan-500/30 text-white p-4">
      
      {/* 1. BACKGROUND LAYERS */}
      <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
          {/* Dark futuristic overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-indigo-950/80"></div>
          {/* Noise Texture */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          {/* Ambient Glows */}
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/30 rounded-full blur-[128px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-600/20 rounded-full blur-[128px]"></div>
      </div>

      {/* 2. MAIN CARD */}
      <div className="relative z-10 w-full max-w-5xl bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT SIDE: Info & Branding */}
        <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center relative overflow-hidden bg-black/20">
          {/* Decorative decorative shapes */}
          <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-10 -translate-y-10">
             <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-1.05.174v-4.102l2.166-1.014a22.549 22.549 0 00-8.823 3.771z"/></svg>
          </div>

          <div className="relative z-10">
            {/* BRANDING HEADER */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20">
                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white">
                Edu<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Whisper</span>
              </h1>
            </div>
            
            <p className="mb-10 text-slate-300 text-lg leading-relaxed font-light">
              Experience the future of educational management. Seamless communication for teachers, students, and parents.
            </p>

            <div className="space-y-5">
              {/* Feature Items with Glass effect */}
              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl shadow-inner group-hover:bg-white/10 transition-colors">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                </div>
                <span className="font-semibold text-slate-200">Real-time Activity Tracking</span>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl shadow-inner group-hover:bg-white/10 transition-colors">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                </div>
                <span className="font-semibold text-slate-200">Secure Digital Signatures</span>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl shadow-inner group-hover:bg-white/10 transition-colors">
                  <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                </div>
                <span className="font-semibold text-slate-200">Instant Notifications</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Login Form */}
        <div className="md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white/5 backdrop-blur-md">
          <div className="mb-10">
             <h2 className="text-3xl font-bold mb-2 text-white tracking-tight">Portal Login</h2>
             <p className="text-slate-400">Enter your credentials to access the system.</p>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 mb-6 text-red-200 flex items-center gap-3 rounded-xl animate-in slide-in-from-top-2">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              <span className="font-medium text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <svg className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                <input
                  type="email"
                  placeholder="name@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 text-white placeholder-slate-500 pl-12 p-4 rounded-xl transition-all outline-none"
                  required
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
               <div className="relative group">
                <svg className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 text-white placeholder-slate-500 pl-12 p-4 rounded-xl transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs font-bold text-cyan-500 hover:text-cyan-300 uppercase tracking-wider transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transform hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            >
              Access Dashboard
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
             <a href="#" className="text-sm font-semibold text-slate-400 hover:text-cyan-400 transition-colors">Forgot password?</a>
             <div className="pt-6 border-t border-white/5">
                <p className="text-xs text-slate-500">
                  EduWhisper v2.0 (Secure Mode)<br/>
                  Protected by ReCaptcha
                </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}