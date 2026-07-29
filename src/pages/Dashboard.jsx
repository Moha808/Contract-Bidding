import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { FileDown, Download, FileSpreadsheet, Calendar, DollarSign, Award } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [bids, setBids] = useState([]);
  const [selectedProjTitle, setSelectedProjTitle] = useState('');

  const activeProjectTitle = selectedProjTitle || (projects.length > 0 ? projects[0].title : '');
  const activeProject = projects.find(p => p.title === activeProjectTitle);
  const activeBids = bids.filter(b => b.projectName === activeProjectTitle);

  const rankedBids = activeBids.map(bid => {
    if (!activeProject) return { ...bid, finalScore: 0 };
    
    const budget = Number(activeProject.budget);
    const bidAmount = Number(bid.amount);
    
    let budgetScore = 0;
    if (bidAmount <= budget) {
      budgetScore = 100 - ((budget - bidAmount) / budget) * 50;
    } else {
      budgetScore = Math.max(0, 100 - ((bidAmount - budget) / budget) * 100);
    }
    
    const deadline = Number(activeProject.deadline);
    const bidDuration = Number(bid.duration);
    let timeScore = 0;
    if (bidDuration <= deadline) {
      timeScore = 100 - ((deadline - bidDuration) / deadline) * 30;
    } else {
      timeScore = Math.max(0, 100 - ((bidDuration - deadline) / deadline) * 100);
    }
    
    const qualityScore = Number(bid.qualityScore);
    const experienceScore = Math.min(100, Number(bid.experience) * 10);
    const onTimeScore = Number(bid.onTimeRate) * 100;
    const disputesPenalty = Number(bid.pastDisputes) * 15;
    
    const finalScore = (budgetScore * 0.3) + (timeScore * 0.2) + (qualityScore * 0.25) + (experienceScore * 0.15) + (onTimeScore * 0.1) - disputesPenalty;
    
    return {
      ...bid,
      budgetScore: Math.round(budgetScore),
      timeScore: Math.round(timeScore),
      finalScore: Math.max(0, Math.round(finalScore * 10) / 10)
    };
  }).sort((a, b) => b.finalScore - a.finalScore);

  useEffect(() => {
    // Listen to Projects in real-time
    const qProjects = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      const projData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projData);
    });

    // Listen to Bids in real-time
    const qBids = query(collection(db, 'bids'), orderBy('createdAt', 'desc'));
    const unsubBids = onSnapshot(qBids, (snapshot) => {
      const bidsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBids(bidsData);
    });

    return () => {
      unsubProjects();
      unsubBids();
    };
  }, []);

  const handleExportPDF = () => exportToPDF(projects, bids);
  const handleExportExcel = () => exportToExcel(projects, bids);

  // Filter bids for the specific contractor logged in (simple match against their name)
  const myBids = bids.filter(bid => bid.contractor.toLowerCase().includes(currentUser?.name?.toLowerCase() || ''));

  // Calculate statistics
  const avgBidAmount = bids.length > 0
    ? (bids.reduce((acc, curr) => acc + Number(curr.amount), 0) / bids.length).toFixed(0)
    : 0;

  const avgDuration = bids.length > 0
    ? (bids.reduce((acc, curr) => acc + Number(curr.duration), 0) / bids.length).toFixed(0)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-slate-800 dark:text-slate-100">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/10">
        <h2 className="text-3xl font-black mb-2">Welcome back, {currentUser?.name}!</h2>
        <p className="text-indigo-100 opacity-90 max-w-xl">
          You are signed in as a <span className="font-bold underline capitalize">{currentUser?.role}</span>.
        </p>
      </div>

      {/* Dynamic Content based on User Role */}
      {currentUser?.role === 'Contractor' && (
        <div className="space-y-8">
          {/* Contractor Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
              <div className="bg-indigo-50 dark:bg-indigo-950 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">My Submitted Bids</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white">{myBids.length}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
              <div className="bg-indigo-50 dark:bg-indigo-950 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">Total Bid Value</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white">
                  ₦{myBids.reduce((acc, curr) => acc + Number(curr.amount), 0).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
              <div className="bg-indigo-50 dark:bg-indigo-950 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">Avg Completion Time</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white">
                  {myBids.length > 0 
                    ? (myBids.reduce((acc, curr) => acc + Number(curr.duration), 0) / myBids.length).toFixed(0) + ' days'
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Contractor Bids Table */}
          <section>
            <h3 className="text-xl font-bold text-slate-850 dark:text-white mb-4">My Submitted Proposals</h3>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-slate-900 dark:bg-slate-950 text-slate-50">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Project Name</th>
                      <th className="px-6 py-4 font-semibold">Amount Offered</th>
                      <th className="px-6 py-4 font-semibold">Completion Time</th>
                      <th className="px-6 py-4 font-semibold">Quality Rating</th>
                      <th className="px-6 py-4 font-semibold">Disputes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {myBids.length > 0 ? (
                      myBids.map((bid, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{bid.projectName}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">₦{Number(bid.amount).toLocaleString()}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{bid.duration} days</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{bid.qualityScore}%</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{bid.pastDisputes}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-900/50">
                          You haven't submitted any bids yet. Click <Link to="/bids/new" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">Submit a Bid</Link> to start.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Engineer, Procurement Officer, and Administrator views */}
      {currentUser?.role !== 'Contractor' && (
        <div className="space-y-8">
          {/* Internal Dashboard Analytics Header */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex gap-3">
              {(currentUser?.role === 'Administrator' || currentUser?.role === 'Procurement Officer') && (
                <Link to="/projects/new" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md transition-colors text-sm">New Project</Link>
              )}
              <Link to="/bids/new" className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold py-2.5 px-5 rounded-xl transition-colors text-sm">Submit Bid</Link>
            </div>
            <div className="flex gap-3">
              <button onClick={handleExportExcel} className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-950/20 text-green-700 dark:text-green-400 border border-slate-200 dark:border-slate-700 font-semibold py-2 px-4 rounded-xl transition-colors text-xs">
                <Download className="w-4 h-4" /> Export Excel
              </button>
              <button onClick={handleExportPDF} className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-700 dark:text-red-400 border border-slate-200 dark:border-slate-700 font-semibold py-2 px-4 rounded-xl transition-colors text-xs">
                <FileDown className="w-4 h-4" /> Export PDF
              </button>
            </div>
          </div>

          {/* Stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">Total Projects</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block">{projects.length}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">Active Bids</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block">{bids.length}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">Avg Bid Amount</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2 block truncate">
                ₦{Number(avgBidAmount).toLocaleString()}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">Avg Completion Time</span>
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2 block">
                {avgDuration} days
              </span>
            </div>
          </div>

          {/* Recent Projects Table */}
          <section>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">All Procurement Projects</h3>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="bg-slate-900 dark:bg-slate-950 text-slate-50">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Title</th>
                      <th className="px-6 py-4 font-semibold">Budget</th>
                      <th className="px-6 py-4 font-semibold">Deadline</th>
                      <th className="px-6 py-4 font-semibold">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {projects.length > 0 ? (
                      projects.map((project, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{project.title}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">₦{Number(project.budget).toLocaleString()}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{project.deadline} days</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{project.category}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-900/50">
                          No projects published yet.{' '}
                          {(currentUser?.role === 'Administrator' || currentUser?.role === 'Procurement Officer') && (
                            <Link to="/projects/new" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">Publish a Project</Link>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Latest Bids Table */}
          <section>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">All Submitted Bids</h3>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead className="bg-slate-900 dark:bg-slate-950 text-slate-50">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Project Name</th>
                      <th className="px-6 py-4 font-semibold">Contractor</th>
                      <th className="px-6 py-4 font-semibold">Amount</th>
                      <th className="px-6 py-4 font-semibold">Duration</th>
                      <th className="px-6 py-4 font-semibold">Quality Rating</th>
                      <th className="px-6 py-4 font-semibold">Disputes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {bids.length > 0 ? (
                      bids.map((bid, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{bid.projectName}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{bid.contractor}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">₦{Number(bid.amount).toLocaleString()}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{bid.duration} days</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{bid.qualityScore}%</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{bid.pastDisputes}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-900/50">
                          No bids submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Decision Evaluation Matrix */}
          <section className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-3xl border border-indigo-500/20 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-indigo-500/20">
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black flex items-start gap-2 text-white">
                  <Award className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400 rotate-12 flex-shrink-0 mt-0.5" />
                  <span>Weighted-Decision Audit & Selection Matrix</span>
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm">Multi-criteria score evaluation for bias-free procurement (AI-free mathematical models)</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
                <span className="text-xs text-slate-300 font-semibold sm:whitespace-nowrap">Target Project:</span>
                <select 
                  value={activeProjectTitle} 
                  onChange={(e) => setSelectedProjTitle(e.target.value)}
                  className="w-full lg:w-64 bg-slate-950 border border-indigo-500/30 rounded-xl px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {projects.map((p, idx) => (
                    <option key={idx} value={p.title} className="bg-slate-950">{p.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {activeProject ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-950/40 p-5 rounded-2xl border border-indigo-500/10">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">College Project Budget</span>
                    <span className="text-xl font-black text-white">₦{Number(activeProject.budget).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Target Deadline limit</span>
                    <span className="text-xl font-black text-indigo-400">{activeProject.deadline} Days</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Bids Received</span>
                    <span className="text-xl font-black text-purple-400">{activeBids.length} submitted</span>
                  </div>
                </div>

                {rankedBids.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left text-sm">
                      <thead className="text-slate-400 border-b border-indigo-500/10">
                        <tr>
                          <th className="py-3 px-4 font-semibold text-xs uppercase">Rank / Contractor</th>
                          <th className="py-3 px-4 font-semibold text-xs uppercase">Bid Amount</th>
                          <th className="py-3 px-4 font-semibold text-xs uppercase">Timeline Deviation</th>
                          <th className="py-3 px-4 font-semibold text-xs uppercase">Past Disputes</th>
                          <th className="py-3 px-4 font-semibold text-xs uppercase text-right">Weighted score (0-100)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-indigo-500/5">
                        {rankedBids.map((bid, index) => {
                          const isWinner = index === 0;
                          return (
                            <tr key={index} className={`transition-colors ${isWinner ? 'bg-indigo-500/10 hover:bg-indigo-500/15' : 'hover:bg-slate-900/30'}`}>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${isWinner ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                    {index + 1}
                                  </span>
                                  <div>
                                    <span className="font-bold text-white block">{bid.contractor}</span>
                                    {isWinner && <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wide">🏆 Optimal Match</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 font-semibold">₦{Number(bid.amount).toLocaleString()}</td>
                              <td className="py-4 px-4">
                                <span className={Number(bid.duration) <= Number(activeProject.deadline) ? 'text-green-400' : 'text-red-400'}>
                                  {bid.duration} days ({Number(bid.duration) - Number(activeProject.deadline) > 0 ? `+${Number(bid.duration) - Number(activeProject.deadline)} days` : 'Within Limit'})
                                </span>
                              </td>
                              <td className="py-4 px-4 font-mono text-slate-300">{bid.pastDisputes}</td>
                              <td className="py-4 px-4 text-right">
                                <span className={`text-lg font-black px-3 py-1 rounded-xl ${isWinner ? 'text-indigo-400 bg-indigo-500/20' : 'text-slate-300 bg-slate-800'}`}>
                                  {bid.finalScore}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 bg-slate-950/20 rounded-2xl border border-indigo-500/5">
                    No bids submitted for this project yet. Contractors can submit proposals using the "Submit Bid" form.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                Please create a project first to evaluate bids.
              </div>
            )}
          </section>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
