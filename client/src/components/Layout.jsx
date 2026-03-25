import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, BarChart3, Bell, Shield, User as UserIcon } from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [identity, setIdentity] = useState({ name: "Guest", role: "Visitor" });

  useEffect(() => {
    // 🛡️ RECOVERY LOGIC: Safely parse the user object from LocalStorage
    const syncIdentity = () => {
      try {
        const savedData = localStorage.getItem('user');
        if (savedData) {
          const parsedUser = JSON.parse(savedData);
          setIdentity({
            name: parsedUser.name || "Authenticated User",
            role: parsedUser.role || localStorage.getItem('role') || "User"
          });
        }
      } catch (error) {
        console.error("Identity Sync Failed:", error);
      }
    };

    syncIdentity();
  }, [location]); // Re-sync every time the route changes

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
        
        {/* LOGO SECTION */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-6 transition-transform shadow-lg shadow-indigo-200">
              <BarChart3 size={20} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 italic">
              TalentScout <span className="text-indigo-600 not-italic">AI</span>
            </span>
          </Link>

          {/* DYNAMIC NAV LINKS */}
          <Link to={identity.role === 'recruiter' ? '/dashboard' : '/apply'} 
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              isActive('/dashboard') || isActive('/apply') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
            }`}>
            {identity.role === 'recruiter' ? 'Recruiter Hub' : 'My Applications'}
          </Link>
        </div>

        {/* IDENTITY & ACTIONS */}
        <div className="flex items-center gap-5">
          <button className="text-slate-400 hover:text-indigo-600 transition-colors">
            <Bell size={20} />
          </button>
          
          <div className="h-8 w-px bg-slate-200" />

          {/* IDENTITY CARD */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              {/* ✅ UPDATED NAME DISPLAY */}
              <p className="text-sm font-black text-slate-800 leading-none">
                {identity.name}
              </p>
              <p className="text-[10px] font-bold text-indigo-500 uppercase mt-1 tracking-widest flex items-center justify-end gap-1">
                {identity.role === 'recruiter' && <Shield size={10} />} {identity.role}
              </p>
            </div>
            
            {/* AVATAR WITH INITIAL */}
            <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-bold transition-transform hover:scale-110">
              {identity.name.charAt(0).toUpperCase()}
            </div>

            {/* LOGOUT */}
            <button 
              onClick={handleLogout} 
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="End Session"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-10 px-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;