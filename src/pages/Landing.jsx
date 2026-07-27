import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ShieldCheck, Zap, Gavel, ArrowRight, Award, Calendar, DollarSign, Sun, Moon } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="group relative bg-white dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl dark:hover:shadow-indigo-500/5 overflow-hidden">
    <div className="absolute -inset-px bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
    <div className="absolute inset-0 bg-white dark:bg-[#0b0f19] rounded-3xl -z-10"></div>
    
    <div className="bg-indigo-50 dark:bg-indigo-950/50 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{description}</p>
  </div>
);

const Landing = () => {
  const { theme, toggleTheme } = useTheme();

  // Bidding cost analysis calculator state
  const [amount, setAmount] = useState(1600000);
  const [duration, setDuration] = useState(45);
  const [quality, setQuality] = useState(85);

  const calculateBidMetrics = () => {
    const budget = 2000000;
    // Calculate variance from expected budget
    const deviation = (((amount - budget) / budget) * 100).toFixed(1);
    
    let evaluationStatus = "Standard Compliance";
    let borderStyle = "text-green-500";
    if (amount > budget * 1.2) {
      evaluationStatus = "Over Budget (Critical)";
      borderStyle = "text-red-500";
    } else if (amount < budget * 0.7) {
      evaluationStatus = "Under-priced (Risk of Low Quality)";
      borderStyle = "text-yellow-500";
    }

    return { deviation, evaluationStatus, borderStyle };
  };

  const { deviation, evaluationStatus, borderStyle } = calculateBidMetrics();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-x-hidden transition-colors duration-300">
      
      {/* Decorative Grid and Ambient Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/5 dark:bg-indigo-600/10 blur-[120px] -z-10 animate-pulse duration-[8000ms]"></div>
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/5 dark:bg-purple-600/10 blur-[120px] -z-10"></div>

      {/* Navigation */}
      <nav className="fixed w-full bg-white/75 dark:bg-[#030712]/75 backdrop-blur-md z-50 border-b border-slate-200 dark:border-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
            <Gavel className="w-8 h-8 rotate-12" />
            <span className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">BidMaster</span>
          </div>
          <div className="flex gap-4 items-center">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
            <Link to="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors px-3 py-2">Sign In</Link>
            <Link to="/register" className="relative group px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl transition-all hover:bg-indigo-500 overflow-hidden shadow-lg shadow-indigo-500/25">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-6 text-left space-y-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium text-xs border border-indigo-100 dark:border-indigo-500/30 backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Federal College of Animal Health and Production Technology, Vom
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.1]">
              Intelligent and Transparent <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">Contract Bidding</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              Eliminate subjective bias, combat favoritism, and track contractor proposals systematically. Built for FCAH&PT Vom, Plateau State.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 dark:bg-white text-white dark:text-slate-950 font-bold rounded-2xl shadow-xl hover:bg-indigo-500 dark:hover:bg-slate-100 transition-all hover:-translate-y-0.5 duration-200 flex items-center justify-center gap-2 group border border-transparent">
                Start Bidding Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900/60 backdrop-blur-xl text-slate-700 dark:text-white font-semibold rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all hover:-translate-y-0.5 duration-200 text-center">
                Access Dashboard
              </Link>
            </div>
          </div>

          {/* Right Live Interactive Cost Analyzer */}
          <div className="lg:col-span-6">
            <div className="relative group rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 p-6 shadow-2xl backdrop-blur-md overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent"></div>
              
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-900">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Gavel className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-sm">Interactive Cost Analysis Tool</h3>
                </div>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                  Formula Engine Active
                </span>
              </div>

              {/* Slider Controls */}
              <div className="space-y-5 mb-8">
                {/* Amount */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-slate-400" /> Bid Amount</span>
                    <span className="text-slate-900 dark:text-white font-mono">₦{amount.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="500000" 
                    max="4000000" 
                    step="50000"
                    value={amount} 
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-600">
                    <span>Min (₦500k)</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">Budget: ₦2M</span>
                    <span>Max (₦4M)</span>
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Completion Period</span>
                    <span className="text-slate-900 dark:text-white font-mono">{duration} Days</span>
                  </div>
                  <input 
                    type="range" 
                    min="15" 
                    max="120" 
                    value={duration} 
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-600">
                    <span>15 Days</span>
                    <span>120 Days</span>
                  </div>
                </div>

                {/* Quality Score */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-slate-400" /> Contractor Quality Rating</span>
                    <span className="text-slate-900 dark:text-white font-mono">{quality}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="100" 
                    value={quality} 
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-600">
                    <span>50%</span>
                    <span>100% (Outstanding)</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Results Display */}
              <div className="bg-slate-50 dark:bg-[#090d16] p-5 rounded-2xl border border-slate-200 dark:border-slate-900/80">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/40">
                    <span className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-wider font-semibold">Budget Deviation</span>
                    <p className={`text-xl sm:text-2xl font-black mt-1 ${Number(deviation) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {Number(deviation) > 0 ? `+${deviation}%` : `${deviation}%`}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/40">
                    <span className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-wider font-semibold">Cost Status</span>
                    <p className={`text-sm sm:text-xs font-black mt-2.5 truncate ${borderStyle}`}>{evaluationStatus}</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 text-center font-medium mt-3">
                  Analyze bid variance values live by moving the sliders
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-slate-200 dark:border-slate-900/80 bg-white/20 dark:bg-slate-950/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white bg-clip-text bg-gradient-to-b from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">100%</span>
            <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wider mt-2">Transparent Auditing</p>
          </div>
          <div>
            <span className="text-4xl md:text-5xl font-black text-indigo-600 dark:text-indigo-400">Variance</span>
            <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wider mt-2">Calculated Instantly</p>
          </div>
          <div>
            <span className="text-4xl md:text-5xl font-black text-purple-600 dark:text-purple-400">&lt; 1s</span>
            <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wider mt-2">Decision Timelines</p>
          </div>
          <div>
            <span className="text-4xl md:text-5xl font-black text-pink-600 dark:text-pink-400">4 Roles</span>
            <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wider mt-2">Collaborative Ecosystem</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-950 dark:text-white mb-4">Architected for Transparency</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm md:text-base">Mitigating favoritism and optimizing resource allocation through standard mathematical evaluations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={ShieldCheck}
              title="Audit-Ready Compliance"
              description="Removes human bias entirely. Every single evaluation is generated purely from quantifiable project cost and rating parameters."
            />
            <FeatureCard 
              icon={Zap}
              title="Instant Reporting Engine"
              description="Export comprehensive summary tables directly to formatted Excel or PDF files instantly for audits."
            />
            <FeatureCard 
              icon={Award}
              title="Quality Index tracking"
              description="Keep strict track of contractor historical performances, disputes, and completion speeds."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-900 py-6 text-slate-500 text-xs transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-950 dark:text-white">
            <Gavel className="w-5 h-5 text-indigo-500" />
            <span className="font-bold tracking-tight">BidMaster</span>
          </div>
          <p>© {new Date().getFullYear()} Federal College of Animal Health and Production Technology, Vom, Plateau State. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
