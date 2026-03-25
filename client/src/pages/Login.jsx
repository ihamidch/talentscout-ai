import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) navigate(role === 'recruiter' ? '/dashboard' : '/apply');
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loginPromise = axios.post('http://localhost:5000/api/auth/login', formData);

    toast.promise(loginPromise, {
      loading: 'Syncing with Neural Engine...',
      success: (res) => {
        const { token, user } = res.data;

        // ✅ 1. STORE ALL DATA
        localStorage.setItem('token', token);
        localStorage.setItem('role', user.role);
        
        // ✅ 2. STORE FULL USER OBJECT (This is what the Header reads)
        localStorage.setItem('user', JSON.stringify(user));

        // ✅ 3. USE HARD REDIRECT
        // This forces the Layout/Header to re-read localStorage immediately
        window.location.href = user.role === 'recruiter' ? '/dashboard' : '/apply';
        
        return `Welcome back, ${user.name}!`;
      },
      error: (err) => err.response?.data?.message || 'Authentication failed.'
    });

    try { 
      await loginPromise; 
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* --- NEON AMBIANCE --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-cyan-500/10 rounded-full blur-[100px]" />

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
      <div className="bg-slate-900/40 backdrop-blur-2xl w-full max-w-md rounded-[48px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] p-12 border border-white/10 relative z-10">
        
        {/* LOGO */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-gradient-to-tr from-indigo-500 via-purple-500 to-fuchsia-500 rounded-3xl text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] mb-6 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
            <Sparkles size={32} fill="white" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white mb-2">
            Talent Scout <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 not-italic">Pro</span>
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em]">Autonomous Recruitment</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* EMAIL */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400/80 ml-4">Neural Identity</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input 
                type="email"
                required
                className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-[24px] outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 focus:bg-slate-800/50 transition-all text-white placeholder:text-slate-600 text-sm"
                placeholder="id@talentscout.pro"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400/80 ml-4">Access Key</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-14 pr-14 py-5 bg-white/5 border border-white/10 rounded-[24px] outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 focus:bg-slate-800/50 transition-all text-white placeholder:text-slate-600 text-sm"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-5 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* GRADIENT BUTTON */}
          <button 
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] hover:from-indigo-500 hover:to-purple-500 active:scale-[0.97] transition-all shadow-[0_20px_40px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 group disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                Initialize Link <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
          <Link 
            to="/register" 
            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors flex items-center justify-center gap-2"
          >
            New Node? <span className="text-white underline decoration-indigo-500 decoration-2 underline-offset-4">Create Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;