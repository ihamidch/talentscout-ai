import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Search, Loader2, Trash2, X, AlertCircle, UserPlus, 
  UserMinus, Sparkles, Zap, BrainCircuit, ShieldAlert, 
  RefreshCw, Activity 
} from 'lucide-react';

const RecruiterDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedApp, setSelectedApp] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isEngineOnline, setIsEngineOnline] = useState(true);

  const fetchCandidates = async () => {
    setIsEngineOnline(true);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/applications/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidates(res.data);
    } catch (err) {
      setIsEngineOnline(false);
      toast.error("Neural Engine Unreachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCandidates(); }, []);

  const updateStatus = async (id, newStatus) => {
    const loadingToast = toast.loading('Syncing Neural Data...');
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/applications/${id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCandidates(prev => prev.map(app => app._id === id ? { ...app, status: newStatus } : app));
      toast.success(`Node marked as ${newStatus}`, { id: loadingToast });
    } catch (err) {
      toast.error("Sync Failed", { id: loadingToast });
    }
  };

  const confirmDelete = async () => {
    const loadingToast = toast.loading('Purging Identity...');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/applications/${deleteConfirm.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidates(prev => prev.filter(app => app._id !== deleteConfirm.id));
      toast.success("Identity Purged", { id: loadingToast });
      setDeleteConfirm(null);
    } catch (err) {
      toast.error("Purge Failed", { id: loadingToast });
    }
  };

  const filtered = candidates.filter(c => {
    const name = c.candidate?.name || "Unknown Candidate";
    const email = c.candidate?.email || "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 lg:p-12 relative overflow-hidden font-sans text-slate-200">
      
      {/* Background Neon Ambiance */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/10 rounded-full blur-[120px] animate-pulse" />

      <Toaster position="top-right" />

      {/* --- TOP BAR --- */}
      <div className="max-w-7xl mx-auto mb-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="h-12 w-12 bg-gradient-to-tr from-indigo-500 to-fuchsia-600 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20 transform -rotate-3">
                <BrainCircuit size={26} />
              </div>
              <div>
                <h1 className="text-4xl font-black italic tracking-tighter text-white leading-none">
                  Neural <span className="text-indigo-400 not-italic font-bold">Pipeline</span>
                </h1>
                <div className="flex items-center gap-2 mt-2">
                   <div className={`h-2 w-2 rounded-full animate-ping ${isEngineOnline ? 'bg-cyan-400' : 'bg-rose-500'}`} />
                   <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
                     System Status: {isEngineOnline ? 'Engine Online' : 'Link Severed'}
                   </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full md:w-[450px] group">
            <Search className="absolute left-6 top-5 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={20} />
            <input 
              className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-[30px] outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 focus:bg-slate-800/40 transition-all text-white font-medium text-sm placeholder:text-slate-700"
              placeholder="Search Candidate Identity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- FILTERS --- */}
        <div className="flex gap-4 mt-12 overflow-x-auto pb-4 no-scrollbar">
          {['all', 'pending', 'shortlisted', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all border shrink-0
                ${filterStatus === s 
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_15px_30px_rgba(79,70,229,0.3)] scale-105' 
                  : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/20 hover:text-slate-300'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* --- CANDIDATE LIST --- */}
      <div className="max-w-7xl mx-auto relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-32 gap-6 text-center">
            <RefreshCw className="animate-spin text-indigo-500" size={48} />
            <p className="text-slate-600 font-black text-xs uppercase tracking-[0.5em] animate-pulse">Syncing Database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filtered.map(app => (
              <div key={app._id} className={`group p-8 rounded-[48px] border bg-slate-900/40 backdrop-blur-2xl flex flex-col lg:flex-row items-center justify-between gap-8 transition-all hover:bg-slate-800/60
                ${app.status === 'shortlisted' ? 'border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.05)]' : 'border-white/5'}`}>
                
                <div className="flex items-center gap-8 w-full lg:w-auto">
                  <div className={`h-24 w-24 rounded-[32px] border-2 flex flex-col items-center justify-center bg-slate-900 shadow-2xl transition-transform group-hover:scale-105
                    ${(app.aiAnalysis?.score || 0) >= 80 ? 'border-cyan-500/50 text-cyan-400' : 'border-white/10 text-indigo-400'}`}>
                    <span className="text-4xl font-black tracking-tighter">{app.aiAnalysis?.score || 0}%</span>
                    <span className="text-[8px] font-black uppercase tracking-tighter mt-1 opacity-50">Score</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter mb-2">{app.candidate?.name || "Unknown"}</h3>
                    <span className="text-[10px] text-slate-400 font-bold tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                      {app.candidate?.email || "No Email"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
                  <button onClick={() => updateStatus(app._id, 'shortlisted')} className={`p-5 rounded-3xl transition-all ${app.status === 'shortlisted' ? 'bg-cyan-500 text-slate-900 shadow-xl' : 'bg-white/5 text-slate-500 hover:text-cyan-400 border border-white/5'}`}>
                    <UserPlus size={22} />
                  </button>
                  <button onClick={() => updateStatus(app._id, 'rejected')} className={`p-5 rounded-3xl transition-all ${app.status === 'rejected' ? 'bg-rose-500 text-white shadow-xl' : 'bg-white/5 text-slate-500 hover:text-rose-400 border border-white/5'}`}>
                    <UserMinus size={22} />
                  </button>
                  <button onClick={() => setSelectedApp(app)} className="h-16 px-12 bg-white text-slate-900 rounded-[32px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-cyan-400 hover:scale-105 transition-all shadow-2xl">
                    Intelligence
                  </button>
                  <button onClick={() => setDeleteConfirm({ id: app._id, name: app.candidate?.name })} className="p-5 bg-transparent border border-white/5 text-slate-700 hover:text-rose-500 rounded-3xl transition-all">
                    <Trash2 size={22} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- UPDATED REPORT MODAL --- */}
      {selectedApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-300">
           <div className="bg-slate-900 w-full max-w-2xl rounded-[60px] border border-white/10 shadow-[0_0_150px_rgba(79,70,229,0.3)] overflow-hidden">
             
             <div className="p-12 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-transparent">
                <div className="flex items-center gap-4">
                  <Sparkles className="text-cyan-400 animate-pulse" />
                  <h2 className="text-4xl font-black italic tracking-tighter text-white leading-none">Analysis Core</h2>
                </div>
                <button onClick={() => setSelectedApp(null)} className="p-3 hover:bg-white/10 rounded-full text-slate-600 transition-colors"><X size={28}/></button>
             </div>

             <div className="p-14 space-y-12">
                {/* IMPROVED DATA GUARD */}
                {(!selectedApp.aiAnalysis?.summary || selectedApp.aiAnalysis.summary.toLowerCase().includes("error") || selectedApp.aiAnalysis.summary === "No analysis available.") ? (
                   <div className="bg-rose-500/5 p-10 rounded-[40px] border border-rose-500/20 text-center relative group">
                    <ShieldAlert size={48} className="text-rose-500 mx-auto mb-6 group-hover:rotate-12 transition-transform" />
                    <h4 className="text-rose-500 font-black text-xs uppercase tracking-[0.4em] mb-3 text-center">Sync Fragmented</h4>
                    <p className="text-slate-400 font-medium leading-relaxed italic text-lg text-center">
                      "The Neural Engine is currently syncing or offline. Check port 8000."
                    </p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div className="bg-white/5 p-10 rounded-[40px] border border-white/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10"><Zap size={50} className="text-cyan-400" /></div>
                      <p className="text-slate-200 font-medium text-xl leading-relaxed italic relative z-10 leading-relaxed">
                        "{selectedApp.aiAnalysis.summary}"
                      </p>
                    </div>

                    {/* DYNAMIC SKILLS TAGS */}
                    {selectedApp.aiAnalysis.skillsMatch?.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 ml-4">Neural Proficiencies</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedApp.aiAnalysis.skillsMatch.map((skill, idx) => (
                            <span key={idx} className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-indigo-500/20">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <button onClick={() => setSelectedApp(null)} className="w-full py-7 bg-indigo-600 text-white rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] hover:bg-indigo-500 shadow-3xl shadow-indigo-500/30 transition-all active:scale-95">
                  Terminate Report
                </button>
             </div>
           </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 w-full max-w-sm rounded-[48px] p-12 border border-rose-500/20 text-center shadow-2xl">
            <ShieldAlert size={48} className="text-rose-500 mx-auto mb-8" />
            <h2 className="text-3xl font-black text-white mb-3 italic tracking-tighter">Purge Data?</h2>
            <p className="text-slate-500 font-medium mb-10 text-sm leading-relaxed uppercase tracking-widest">
              Removing <span className="text-white underline decoration-rose-500 decoration-4">{deleteConfirm.name}</span> will erase all traces.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setDeleteConfirm(null)} className="py-5 bg-white/5 text-slate-500 rounded-3xl font-black text-[10px] uppercase hover:bg-white/10 transition-all">Abort</button>
              <button onClick={confirmDelete} className="py-5 bg-rose-600 text-white rounded-3xl font-black text-[10px] uppercase hover:bg-rose-500 shadow-xl transition-all">Confirm Purge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;