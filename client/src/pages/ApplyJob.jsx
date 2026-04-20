import React, { useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../api.js';
import { 
  Upload, FileText, Target, AlertCircle, Sparkles, 
  CheckCircle2, ChevronRight, BrainCircuit, Loader2, Zap,
  Dna // Added for the Match section
} from 'lucide-react';

const ApplyJob = ({ selectedJobId }) => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !jobDescription) return alert("Please provide both Resume and Job Description");

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);
    formData.append('jobId', selectedJobId || "65f1234567890abcdef12345");

    setLoading(true);
    try {
      const res = await axios.post(apiUrl('/api/applications/apply'), formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      // ✅ Now mapping the full aiAnalysis object including matched/missing skills
      setResult(res.data.aiAnalysis);
    } catch (err) {
      const d = err.response?.data;
      const extra = [d?.hint, d?.detail, d?.reason].filter(Boolean).join(" — ");
      alert(
        "Error: " +
          (d?.message || err.message || "AI Engine Offline") +
          (extra ? `\n${extra}` : ""),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] py-12 px-4 md:px-8 relative overflow-hidden font-sans text-slate-200">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-fuchsia-600/10 rounded-full blur-[120px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                <BrainCircuit className="text-white" size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-white italic">
                Talent Scout <span className="text-indigo-400 not-italic font-bold">AI</span>
              </h1>
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] ml-1">Llama 3.3 Neural Matching</p>
          </div>
          {result && (
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-xs font-black uppercase tracking-widest text-indigo-400 hover:bg-white/10 transition-all"
            >
              Analyze New Resume
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: INPUTS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/10 p-8 shadow-2xl">
              <h2 className="text-lg font-black text-white mb-8 flex items-center gap-3 italic tracking-tight">
                <Zap size={20} className="text-cyan-400 fill-cyan-400/20" /> Analysis Input
              </h2>
              
              <form onSubmit={handleUpload} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/80 mb-3 block ml-1">Target Description</label>
                  <textarea 
                    className="w-full p-5 bg-white/5 border border-white/10 rounded-3xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 outline-none transition-all text-sm min-h-[220px] resize-none text-slate-300 placeholder:text-slate-600"
                    placeholder="Paste the job requirements here..."
                    value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/80 mb-3 block ml-1">Resume Node (PDF)</label>
                  <label className={`flex items-center gap-4 p-5 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${
                    file ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/10 bg-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5'
                  }`}>
                    <div className={`p-3 rounded-2xl ${file ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {file ? <CheckCircle2 size={20} /> : <Upload size={20} />}
                    </div>
                    <span className="text-sm font-bold text-slate-300 truncate">
                      {file ? file.name : "Select Resume File"}
                    </span>
                    <input type="file" className="hidden" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(79,70,229,0.2)] disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Launch Analysis"}
                  {!loading && <ChevronRight size={18} />}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="lg:col-span-7">
            {!result && !loading && (
              <div className="h-full min-h-[500px] border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center text-slate-500 p-12 text-center bg-white/[0.02]">
                <Sparkles size={60} className="mb-6 text-indigo-500/30 animate-pulse" />
                <p className="text-sm font-black uppercase tracking-[0.2em]">Awaiting Neural Data</p>
                <p className="text-xs font-medium text-slate-600 mt-2">Upload resume and JD to activate AI Engine</p>
              </div>
            )}

            {loading && (
              <div className="h-full min-h-[500px] bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/10 flex flex-col items-center justify-center p-12 text-center shadow-2xl">
                <div className="relative mb-8">
                  <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 animate-pulse" size={28} />
                </div>
                <p className="font-black text-white text-xl tracking-tight italic">Llama 3.3 is Thinking...</p>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Cross-referencing technical clusters</p>
              </div>
            )}

            {result && (
              <div className="bg-slate-900/60 backdrop-blur-2xl rounded-[40px] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-12 duration-700">
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-10 flex items-center justify-between border-b border-white/5">
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tighter italic">Analysis Core</h3>
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Llama-Powered Precision</p>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                    <div className="h-24 w-24 rounded-[32px] bg-indigo-600 flex flex-col items-center justify-center shadow-2xl border-2 border-white/20 relative">
                      <span className="text-4xl font-black text-white leading-none">{result.score}%</span>
                      <span className="text-[8px] font-black uppercase tracking-tighter text-indigo-200 mt-1">Match Rate</span>
                    </div>
                  </div>
                </div>

                <div className="p-10 space-y-10">
                  <div className="relative p-6 rounded-3xl bg-white/[0.03] border border-white/5">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                      <Sparkles size={14} className="text-indigo-400" /> Executive Summary
                    </h4>
                    <p className="text-slate-300 leading-relaxed font-medium text-lg italic">
                      "{result.summary}"
                    </p>
                  </div>

                  {/* ✅ ADDED: NEURAL MATCHES (Matched Skills) */}
                  {result.matched_skills?.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-5 flex items-center gap-2">
                        <Dna size={14} /> Neural Matches
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {result.matched_skills.map((skill, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl text-cyan-300 text-[11px] font-black uppercase tracking-wider group hover:bg-cyan-500/10 transition-colors">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MISSING SKILLS */}
                  {result.missing_skills?.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-400 mb-5 flex items-center gap-2">
                        <AlertCircle size={14} /> Critical Knowledge Gaps
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {result.missing_skills.map((skill, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-2xl text-fuchsia-300 text-[11px] font-black uppercase tracking-wider group hover:bg-fuchsia-500/10 transition-colors">
                            <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.8)]" />
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyJob;