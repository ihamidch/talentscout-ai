import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Rocket, ShieldCheck } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-blue-600">TalentScout AI</div>
        <Link to="/login" className="text-gray-600 font-medium hover:text-blue-600 transition">Login</Link>
      </nav>

      <header className="pt-20 pb-32 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Hire with <span className="text-blue-600">AI Intelligence</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          The next-gen RAG engine for ranking candidates. Stop manual screening and start 
          hiring the top 1% automatically.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link to="/register" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all hover:-translate-y-1">
            Get Started for Free
          </Link>
          <Link to="/login" className="bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all">
            View Demo
          </Link>
        </div>
      </header>

      {/* Features */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <BrainCircuit className="text-blue-600 mb-4" size={40} />
            <h3 className="text-xl font-bold mb-2">Smart RAG Engine</h3>
            <p className="text-gray-500">Retrieval-Augmented Generation to understand resumes better than humans.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <ShieldCheck className="text-green-500 mb-4" size={40} />
            <h3 className="text-xl font-bold mb-2">RBAC Security</h3>
            <p className="text-gray-500">Secure role-based access for Recruiters and Candidates.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <Rocket className="text-purple-600 mb-4" size={40} />
            <h3 className="text-xl font-bold mb-2">FastAPI Speed</h3>
            <p className="text-gray-500">Lightning-fast processing of 100+ page PDF documents.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing; // CRITICAL: This fixes the Export Error