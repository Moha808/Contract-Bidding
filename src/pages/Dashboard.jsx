import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import Modal from '../components/Modal';
import {
  FileDown, Download, FileSpreadsheet, Calendar, DollarSign,
  Award, ClipboardList, CheckCircle2, XCircle, Clock, BarChart3, FolderOpen, Users
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

/* ─── Shared helpers ─── */
const StatusBadge = ({ status }) => {
  const map = {
    Accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Awarded: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Open: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
      {status || 'Pending'}
    </span>
  );
};

const StatCard = ({ icon, label, value, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400',
    green:  'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400',
    red:    'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
    amber:  'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
      <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      <div>
        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">{label}</span>
        <span className="text-2xl font-black text-slate-800 dark:text-white">{value}</span>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
const Dashboard = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [bids, setBids] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProjTitle, setSelectedProjTitle] = useState('');
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });

  const showModal = (type, title, message, onConfirm = null) =>
    setModal({ isOpen: true, type, title, message, onConfirm });
  const closeModal = () => setModal(m => ({ ...m, isOpen: false }));

  /* ── Real-time listeners ── */
  useEffect(() => {
    const qP = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const qB = query(collection(db, 'bids'), orderBy('createdAt', 'desc'));
    const unP = onSnapshot(qP, s => setProjects(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unB = onSnapshot(qB, s => setBids(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    let unU = () => {};
    if (currentUser?.role === 'Administrator') {
      const qU = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      unU = onSnapshot(qU, s => setUsers(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    }

    return () => { unP(); unB(); unU(); };
  }, [currentUser]);

  /* ── Evaluation Matrix logic ── */
  const activeProjectTitle = selectedProjTitle || (projects.length > 0 ? projects[0].title : '');
  const activeProject = projects.find(p => p.title === activeProjectTitle);
  const activeBids = bids.filter(b => {
    if (!b.projectName || !activeProjectTitle) return false;
    return b.projectName.toLowerCase().trim() === activeProjectTitle.toLowerCase().trim() ||
      b.projectName.toLowerCase().includes(activeProjectTitle.toLowerCase()) ||
      activeProjectTitle.toLowerCase().includes(b.projectName.toLowerCase());
  });

  const rankedBids = activeBids.map(bid => {
    if (!activeProject) return { ...bid, finalScore: 0 };
    
    // 1. Budget Score (Lower is better, up to the budget)
    const budget = Number(activeProject.budget);
    const bidAmount = Number(bid.amount);
    let budgetScore = 0;
    if (bidAmount <= budget) {
      // If under budget, they get full 100 points
      budgetScore = 100;
    } else {
      // Penalty for being over budget (e.g. 10% over = 90 points)
      budgetScore = Math.max(0, 100 - ((bidAmount - budget) / budget) * 100);
    }
    
    // 2. Time Score (Shorter is better, up to the deadline)
    const deadline = Number(activeProject.deadline);
    const bidDuration = Number(bid.duration);
    let timeScore = 0;
    if (bidDuration <= deadline) {
      timeScore = 100;
    } else {
      timeScore = Math.max(0, 100 - ((bidDuration - deadline) / deadline) * 100);
    }
    
    // 3. Other Metrics
    const qualityScore = Number(bid.qualityScore); // 0-100
    const experienceScore = Math.min(100, Number(bid.experience) * 10); // 10 pts per year, max 100
    const onTimeScore = Number(bid.onTimeRate) * 100; // 0-1 mapped to 0-100
    const disputesPenalty = Number(bid.pastDisputes) * 15; // -15 pts per dispute
    
    // Weighted Sum (Total 100%)
    const finalScore = (budgetScore * 0.3) + (timeScore * 0.2) + (qualityScore * 0.25) + (experienceScore * 0.15) + (onTimeScore * 0.1) - disputesPenalty;
    
    return { 
      ...bid, 
      budgetScore: Math.round(budgetScore), 
      timeScore: Math.round(timeScore), 
      finalScore: Math.max(0, Math.round(finalScore * 10) / 10) 
    };
  }).sort((a, b) => b.finalScore - a.finalScore);

  /* ── Contractor's own bids ── */
  const myBids = bids.filter(bid =>
    bid.contractor?.toLowerCase().includes(currentUser?.name?.toLowerCase() || '')
  );

  /* ── Aggregates ── */
  const acceptedBids = bids.filter(b => b.status === 'Accepted');
  const rejectedBids = bids.filter(b => b.status === 'Rejected');
  const pendingBids  = bids.filter(b => !b.status || b.status === 'Pending');
  const totalBudget  = projects.reduce((a, p) => a + Number(p.budget || 0), 0);
  const avgBidAmount = bids.length > 0 ? Math.round(bids.reduce((a, b) => a + Number(b.amount), 0) / bids.length) : 0;

  /* ── Actions ── */
  const handleRespondToBid = (bidId, status) => {
    const isAccepting = status === 'Accepted';
    const message = isAccepting 
      ? 'Are you sure you want to ACCEPT this bid? The project will be marked as Awarded and all other pending bids for this project will be automatically Rejected.'
      : 'Are you sure you want to REJECT this bid?';

    showModal('confirm',
      `${isAccepting ? 'Accept' : 'Reject'} this bid?`,
      message,
      async () => {
        try {
          if (isAccepting) {
            // Find the bid we are accepting
            const winningBid = bids.find(b => b.id === bidId);
            if (!winningBid) return;

            const batch = writeBatch(db);
            
            // 1. Mark this bid as accepted
            batch.update(doc(db, 'bids', bidId), { status: 'Accepted' });

            // 2. Mark project as Awarded
            const project = projects.find(p => p.title?.toLowerCase().trim() === winningBid.projectName?.toLowerCase().trim());
            if (project) {
              batch.update(doc(db, 'projects', project.id), { 
                status: 'Awarded',
                awardedTo: winningBid.contractor,
                awardedAmount: winningBid.amount
              });
            }

            // 3. Reject all other pending bids for this project
            const otherBids = bids.filter(b => 
              b.id !== bidId && 
              b.projectName?.toLowerCase().trim() === winningBid.projectName?.toLowerCase().trim() && 
              (!b.status || b.status === 'Pending')
            );
            otherBids.forEach(b => {
              batch.update(doc(db, 'bids', b.id), { status: 'Rejected' });
            });

            await batch.commit();
            showModal('success', 'Project Awarded!', 'The bid has been accepted and other bidders have been notified.');
          } else {
            // Just rejecting a single bid
            await updateDoc(doc(db, 'bids', bidId), { status });
            showModal('success', 'Done!', 'Bid has been rejected.');
          }
        } catch (error) {
          console.error(error);
          showModal('error', 'Failed', 'Could not update status. Please try again.');
        }
      }
    );
  };

  const handleExportPDF   = () => exportToPDF(projects, bids);
  const handleExportExcel = () => exportToExcel(projects, bids);

  /* ══════════════════════════════════════════════
     SHARED: Evaluation Matrix (Engineer + Admin)
  ══════════════════════════════════════════════ */
  const EvaluationMatrix = () => (
    <section className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-3xl border border-indigo-500/20 text-white shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-indigo-500/20">
        <div>
          <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-white">
            <Award className="w-6 h-6 text-indigo-400" /> Weighted-Decision Audit &amp; Selection Matrix
          </h3>
          <p className="text-slate-400 text-xs mt-1">Multi-criteria score evaluation for bias-free procurement (mathematical model)</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full lg:w-auto">
          <span className="text-xs text-slate-300 font-semibold sm:whitespace-nowrap">Target Project:</span>
          <select
            value={activeProjectTitle}
            onChange={e => setSelectedProjTitle(e.target.value)}
            className="w-full lg:w-64 bg-slate-950 border border-indigo-500/30 rounded-xl px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            {projects.map((p, i) => <option key={i} value={p.title} className="bg-slate-950">{p.title}</option>)}
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
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Target Deadline</span>
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
                    <th className="py-3 px-4 font-semibold text-xs uppercase">Timeline</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase">Disputes</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase">Status</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase text-right">Score (0–100)</th>
                    {(currentUser?.role === 'Engineer' || currentUser?.role === 'Administrator') && (
                      <th className="py-3 px-4 font-semibold text-xs uppercase text-center">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-500/5">
                  {rankedBids.map((bid, index) => {
                    const isWinner = index === 0;
                    return (
                      <tr key={index} className={`transition-colors ${isWinner ? 'bg-indigo-500/10 hover:bg-indigo-500/15' : 'hover:bg-slate-900/30'}`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${isWinner ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{index + 1}</span>
                            <div>
                              <span className="font-bold text-white block">{bid.contractor}</span>
                              {isWinner && <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wide">🏆 Optimal Match</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold">₦{Number(bid.amount).toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <span className={Number(bid.duration) <= Number(activeProject.deadline) ? 'text-green-400' : 'text-red-400'}>
                            {bid.duration}d {Number(bid.duration) > Number(activeProject.deadline) ? `(+${Number(bid.duration) - Number(activeProject.deadline)}d)` : '✓'}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-300">{bid.pastDisputes}</td>
                        <td className="py-4 px-4"><StatusBadge status={bid.status} /></td>
                        <td className="py-4 px-4 text-right">
                          <span className={`text-lg font-black px-3 py-1 rounded-xl ${isWinner ? 'text-indigo-400 bg-indigo-500/20' : 'text-slate-300 bg-slate-800'}`}>{bid.finalScore}</span>
                        </td>
                        {(currentUser?.role === 'Engineer' || currentUser?.role === 'Administrator') && (
                          <td className="py-4 px-4">
                            <div className="flex gap-2 justify-center">
                              <button 
                                onClick={() => handleRespondToBid(bid.id, 'Accepted')} 
                                disabled={bid.status === 'Accepted' || activeProject.status === 'Awarded'} 
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${bid.status === 'Accepted' ? 'bg-green-500 text-white cursor-default' : (activeProject.status === 'Awarded' ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20')}`}
                                title={activeProject.status === 'Awarded' && bid.status !== 'Accepted' ? 'Project already awarded to another bidder' : ''}
                              >
                                {bid.status === 'Accepted' ? 'Accepted ✓' : 'Accept'}
                              </button>
                              <button onClick={() => handleRespondToBid(bid.id, 'Rejected')} disabled={bid.status === 'Rejected'} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${bid.status === 'Rejected' ? 'bg-red-500 text-white cursor-default' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}>
                                {bid.status === 'Rejected' ? 'Rejected ✗' : 'Reject'}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 bg-slate-950/20 rounded-2xl border border-indigo-500/5">
              No bids submitted for this project yet.
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">Please create a project first to evaluate bids.</div>
      )}
    </section>
  );

  /* ══════════════════════════════════════════
     SHARED: All Bids Table
  ══════════════════════════════════════════ */
  const AllBidsTable = ({ showActions = false }) => (
    <section>
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">All Submitted Bids</h3>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-900 dark:bg-slate-950 text-slate-50">
              <tr>
                <th className="px-6 py-4 font-semibold">Project</th>
                <th className="px-6 py-4 font-semibold">Contractor</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Duration</th>
                <th className="px-6 py-4 font-semibold">Quality</th>
                <th className="px-6 py-4 font-semibold">Disputes</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                {showActions && <th className="px-6 py-4 font-semibold text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bids.length > 0 ? bids.map((bid, idx) => {
                const project = projects.find(p => p.title?.toLowerCase() === bid.projectName?.toLowerCase());
                const isAwarded = project?.status === 'Awarded';
                return (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{bid.projectName}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{bid.contractor}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">₦{Number(bid.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{bid.duration} days</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{bid.qualityScore}%</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{bid.pastDisputes}</td>
                  <td className="px-6 py-4"><StatusBadge status={bid.status} /></td>
                  {showActions && (
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => handleRespondToBid(bid.id, 'Accepted')} 
                          disabled={bid.status === 'Accepted' || isAwarded} 
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${bid.status === 'Accepted' ? 'bg-green-500 text-white cursor-default' : (isAwarded ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400')}`}
                          title={isAwarded && bid.status !== 'Accepted' ? 'Project already awarded to another bidder' : ''}
                        >
                          {bid.status === 'Accepted' ? 'Accepted ✓' : 'Accept'}
                        </button>
                        <button onClick={() => handleRespondToBid(bid.id, 'Rejected')} disabled={bid.status === 'Rejected'} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${bid.status === 'Rejected' ? 'bg-red-500 text-white cursor-default' : 'bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400'}`}>
                          {bid.status === 'Rejected' ? 'Rejected ✗' : 'Reject'}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )}) : (
                <tr><td colSpan={showActions ? 8 : 7} className="px-6 py-8 text-center text-slate-400">No bids submitted yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  /* ══════════════════════════════════════════
     SHARED: All Projects Table
  ══════════════════════════════════════════ */
  const AllProjectsTable = () => (
    <section>
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">All Procurement Projects</h3>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-900 dark:bg-slate-950 text-slate-50">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Budget</th>
                <th className="px-6 py-4 font-semibold">Deadline</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Bids</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {projects.length > 0 ? projects.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{p.title}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">₦{Number(p.budget).toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{p.deadline} days</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{p.category}</td>
                  <td className="px-6 py-4"><StatusBadge status={p.status || 'Open'} /></td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                      {bids.filter(b => b.projectName?.toLowerCase() === p.title?.toLowerCase()).length} bids
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                  No projects yet. <Link to="/projects/new" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">Publish one</Link>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  /* ══════════════════════════════════════════
     SHARED: Export Toolbar
  ══════════════════════════════════════════ */
  const ExportToolbar = ({ showNewProject = false }) => (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex gap-3">
        {showNewProject && (
          <Link to="/projects/new" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md transition-colors text-sm">
            + New Project
          </Link>
        )}
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
  );

  /* ══════════════════════════════════
     ROLE VIEWS
  ══════════════════════════════════ */

  /* ── CONTRACTOR ── */
  const ContractorView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<FileSpreadsheet className="w-6 h-6" />} label="My Submitted Bids" value={myBids.length} />
        <StatCard icon={<CheckCircle2 className="w-6 h-6" />} label="Accepted" value={myBids.filter(b => b.status === 'Accepted').length} color="green" />
        <StatCard icon={<Clock className="w-6 h-6" />} label="Pending Review" value={myBids.filter(b => !b.status || b.status === 'Pending').length} color="amber" />
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-blue-800 dark:text-blue-300 text-sm">Ready to submit a new bid?</p>
          <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">Select a published project and submit your proposal for evaluation.</p>
        </div>
        <Link to="/bids/new" className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-5 rounded-xl text-sm transition-colors">
          Submit Bid
        </Link>
      </div>

      <section>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">My Submitted Proposals</h3>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-900 dark:bg-slate-950 text-slate-50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Project Name</th>
                  <th className="px-6 py-4 font-semibold">Amount Offered</th>
                  <th className="px-6 py-4 font-semibold">Completion Time</th>
                  <th className="px-6 py-4 font-semibold">Quality Rating</th>
                  <th className="px-6 py-4 font-semibold">Disputes</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {myBids.length > 0 ? myBids.map((bid, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{bid.projectName}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">₦{Number(bid.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{bid.duration} days</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{bid.qualityScore}%</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{bid.pastDisputes}</td>
                    <td className="px-6 py-4"><StatusBadge status={bid.status} /></td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    No bids yet. <Link to="/bids/new" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">Submit your first bid</Link>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );

  /* ── PROCUREMENT OFFICER ── */
  const ProcurementView = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Procurement Control Center</h3>
          <p className="text-blue-100 mt-1">Manage project publications and monitor incoming contractor proposals.</p>
        </div>
        <Link to="/projects/new" className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-xl shadow-md transition-colors text-sm">
          + Publish New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<FolderOpen className="w-6 h-6" />} label="Projects Published" value={projects.length} />
        <StatCard icon={<ClipboardList className="w-6 h-6" />} label="Bids Received" value={bids.length} color="purple" />
        <StatCard icon={<DollarSign className="w-6 h-6" />} label="Total Budget" value={`₦${(totalBudget / 1e6).toFixed(1)}M`} color="green" />
        <StatCard icon={<BarChart3 className="w-6 h-6" />} label="Avg Bid Amount" value={`₦${(avgBidAmount / 1e6).toFixed(1)}M`} color="amber" />
      </div>

      <AllProjectsTable />
      
      <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Recent Proposals Received</h3>
          <ExportToolbar showNewProject={false} />
        </div>
        <AllBidsTable showActions={false} />
      </div>
    </div>
  );

  /* ── ENGINEER ── */
  const EngineerView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Clock className="w-6 h-6" />} label="Bids Pending Review" value={pendingBids.length} color="amber" />
        <StatCard icon={<CheckCircle2 className="w-6 h-6" />} label="Bids Accepted" value={acceptedBids.length} color="green" />
        <StatCard icon={<XCircle className="w-6 h-6" />} label="Bids Rejected" value={rejectedBids.length} color="red" />
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={handleExportExcel} className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-950/20 text-green-700 dark:text-green-400 border border-slate-200 dark:border-slate-700 font-semibold py-2 px-4 rounded-xl transition-colors text-xs">
          <Download className="w-4 h-4" /> Export Excel
        </button>
        <button onClick={handleExportPDF} className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-700 dark:text-red-400 border border-slate-200 dark:border-slate-700 font-semibold py-2 px-4 rounded-xl transition-colors text-xs">
          <FileDown className="w-4 h-4" /> Export PDF
        </button>
      </div>

      <AllBidsTable showActions={true} />
      <EvaluationMatrix />
    </div>
  );

  /* ── ADMINISTRATOR ── */
  const AdminView = () => {
    const roleColors = {
      Administrator: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'Procurement Officer': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Engineer: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      Contractor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };

    return (
      <div className="space-y-8">
        {/* Admin Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-500/20 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest">System Administrator</span>
              <h3 className="text-2xl sm:text-3xl font-black mt-1">Master Control Panel</h3>
              <p className="text-slate-400 text-sm mt-1">Full system access — manage users, projects, bids, and evaluations.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/projects/new" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-colors text-sm">
                + New Project
              </Link>
              <button onClick={handleExportExcel} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm">
                <Download className="w-4 h-4" /> Excel
              </button>
              <button onClick={handleExportPDF} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm">
                <FileDown className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <StatCard icon={<Users className="w-6 h-6" />} label="Total Users" value={users.length} color="purple" />
          <StatCard icon={<FolderOpen className="w-6 h-6" />} label="Total Projects" value={projects.length} />
          <StatCard icon={<CheckCircle2 className="w-6 h-6" />} label="Bids Accepted" value={acceptedBids.length} color="green" />
          <StatCard icon={<ClipboardList className="w-6 h-6" />} label="Total Bids" value={bids.length} color="amber" />
        </div>

        {/* Users Management Table — full width */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-indigo-500" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">User Management</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
              {users.length} registered
            </span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-slate-900 dark:bg-slate-950 text-slate-50">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Joined</th>
                    <th className="px-6 py-4 font-semibold">Bids</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.length > 0 ? users.map((u, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {(u.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white">{u.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${roleColors[u.role] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                          {u.role || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {bids.filter(b => b.contractor?.toLowerCase() === u.name?.toLowerCase()).length}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400">No registered users yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Projects — full width */}
        <AllProjectsTable />

        {/* Bids — full width with actions */}
        <AllBidsTable showActions={true} />

        {/* Evaluation Matrix */}
        <EvaluationMatrix />
      </div>
    );
  };

  /* ══════════════════════════════════
     ROOT RENDER
  ══════════════════════════════════ */
  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-slate-800 dark:text-slate-100">
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        confirmText="Yes, Proceed"
        cancelText="Cancel"
      />

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/10">
        <h2 className="text-3xl font-black mb-2">Welcome back, {currentUser?.name}!</h2>
        <p className="text-indigo-100 opacity-90 max-w-xl">
          You are signed in as a <span className="font-bold underline capitalize">{currentUser?.role}</span>.
          {currentUser?.role === 'Contractor' && ' Track your submitted bids and their statuses below.'}
          {currentUser?.role === 'Procurement Officer' && ' Manage projects and monitor incoming contractor bids.'}
          {currentUser?.role === 'Engineer' && ' Review and evaluate contractor bids using the decision matrix.'}
          {currentUser?.role === 'Administrator' && ' Full system oversight — manage projects, bids, and evaluations.'}
        </p>
      </div>

      {currentUser?.role === 'Contractor'          && <ContractorView />}
      {currentUser?.role === 'Procurement Officer' && <ProcurementView />}
      {currentUser?.role === 'Engineer'            && <EngineerView />}
      {currentUser?.role === 'Administrator'       && <AdminView />}
    </div>
  );
};

export default Dashboard;
