import React, { useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../api.js';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { User, Briefcase, Mail, Lock, UserPlus, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const registerPromise = axios.post(apiUrl('/api/auth/register'), formData);

    toast.promise(registerPromise, {
      loading: 'Initializing Neural Profile...',
      success: () => {
        setTimeout(() => navigate('/login'), 2000);
        return "Node created! Redirecting to login...";
      },
      error: (err) => err.response?.data?.message || "Registration failed"
    });

    try {
      await registerPromise;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 py-12 relative overflow-hidden font-sans">
      
      {/* --- NEON AMBIANCE --- */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-fuchsia-600/20 rounded-full blur-[120px] animate-pulse" />

      <Toaster 
        toastOptions={{
          style: {
            background: '#1E293B',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px'
          }
        }} 
      />
      
      {/* --- GLASS CARD --- */}
      <div className="max-w-md w-full bg-slate-900/40 backdrop-blur-2xl rounded-[48px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] p-10 border border-white/10 relative z-10 overflow-hidden">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-14 w-14 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-2xl text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] mb-4">
            <Sparkles size={28} fill="white" />
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter text-white">Join the Network</h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">AI-Powered Talent Matching</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* --- ROLE SELECTION --- */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'candidate' })}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${
                formData.role === 'candidate' 
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/10'
              }`}
            >
              <User size={20} className={formData.role === 'candidate' ? 'animate-bounce' : ''} />
              <span className="text-[10px] font-black uppercase tracking-widest">Candidate</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'recruiter' })}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${
                formData.role === 'recruiter' 
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/10'
              }`}
            >
              <Briefcase size={20} className={formData.role === 'recruiter' ? 'animate-bounce' : ''} />
              <span className="text-[10px] font-black uppercase tracking-widest">Recruiter</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div className="relative group">
              <UserPlus className="absolute left-4 top-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input 
                type="text" placeholder="Full Name" required
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-[20px] outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 focus:bg-slate-800/50 transition-all text-white placeholder:text-slate-600 text-sm"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <Mail className="absolute left-4 top-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input 
                type="email" placeholder="Email Address" required
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-[20px] outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 focus:bg-slate-800/50 transition-all text-white placeholder:text-slate-600 text-sm"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <Lock className="absolute left-4 top-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input 
                type="password" placeholder="Create Password" required
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-[20px] outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 focus:bg-slate-800/50 transition-all text-white placeholder:text-slate-600 text-sm"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[20px] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:from-indigo-500 hover:to-purple-500 active:scale-[0.97] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (
              <>Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>

        <p className="text-center mt-10 text-[10px] text-slate-500 font-black uppercase tracking-widest">
          Joined before?{' '}
          <Link to="/login" className="text-white hover:text-cyan-400 underline decoration-indigo-500 decoration-2 underline-offset-4 transition-colors">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;