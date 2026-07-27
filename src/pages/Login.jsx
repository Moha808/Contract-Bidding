import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gavel, Eye, EyeOff, ShieldCheck, FileCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Left Column: Visual Splash (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950 border-r border-slate-900">
        {/* Background Image with subtle overlay */}
        <div className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-luminosity" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80')" }}></div>
        
        {/* Neon Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px]"></div>

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <Link to="/" className="inline-flex items-center gap-2 text-indigo-400">
            <Gavel className="w-8 h-8 rotate-12" />
            <span className="text-2xl font-black tracking-tight text-white">BidMaster</span>
          </Link>

          <div className="max-w-md">
            <span className="text-xs text-indigo-400 font-semibold tracking-wider uppercase block mb-3">FCAH&PT Vom, Plateau State</span>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Contract Bidding <br/>
              Management Portal
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              Providing a secure, digital framework for bidding cost estimations, proposal submissions, and transparent auditing processes.
            </p>
          </div>

          <div className="flex gap-6 border-t border-slate-900 pt-8 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Bias Free Auditing</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-purple-400" />
              <span>Real-Time Reports</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-md w-full animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="mb-8">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2 text-indigo-400 mb-6">
              <Gavel className="w-7 h-7 rotate-12" />
              <span className="text-xl font-bold tracking-tight text-white">BidMaster</span>
            </Link>
            <h1 className="text-3xl font-black text-white tracking-tight">Welcome back</h1>
            <p className="text-slate-400 mt-2 text-sm">Sign in to access your custom bidding portal</p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-300">Password</label>
                  <a href="#" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">Forgot password?</a>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/50 pl-4 pr-12 py-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 active:translate-y-0 mt-2">
                Sign In
              </button>
            </form>
          </div>

          <p className="text-center mt-8 text-slate-400 text-sm">
            Don't have an account? <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Sign up for free</Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;
