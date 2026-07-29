import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const NewBid = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    projectName: '',
    contractor: '',
    amount: '',
    duration: '',
    experience: '',
    qualityScore: '',
    onTimeRate: '',
    pastDisputes: ''
  });

  useEffect(() => {
    let unsubProjects = () => {};

    const fetchProjects = () => {
      try {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        unsubProjects = onSnapshot(q, (snapshot) => {
          const fetchedProjects = snapshot.docs.map(doc => doc.data());
          setProjects(fetchedProjects);
          
          setFormData(prev => ({
            ...prev,
            projectName: prev.projectName || (fetchedProjects.length > 0 ? fetchedProjects[0].title : ''),
            contractor: currentUser?.role === 'Contractor' ? currentUser.name : prev.contractor
          }));
        });
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    
    fetchProjects();

    return () => {
      unsubProjects();
    };
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const newBid = {
        ...formData,
        amount: Number(formData.amount),
        duration: Number(formData.duration),
        experience: Number(formData.experience),
        qualityScore: Number(formData.qualityScore),
        onTimeRate: Number(formData.onTimeRate),
        pastDisputes: Number(formData.pastDisputes),
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'bids'), newBid);
      navigate('/dashboard');
    } catch (error) {
      console.error("Error adding bid: ", error);
      alert("Failed to submit bid");
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="glass-panel p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Submit Bid Proposal</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Submit a formal project proposal to the evaluation committee</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Select Project</label>
              <select 
                name="projectName" 
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                onChange={handleChange}
                value={formData.projectName}
                required
              >
                <option value="" disabled>-- Select a Project --</option>
                {projects.map((p, i) => (
                  <option key={i} value={p.title}>{p.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Contractor Name</label>
              <input 
                type="text" 
                name="contractor"
                required
                readOnly={currentUser?.role === 'Contractor'}
                value={formData.contractor}
                placeholder="e.g. BASHIRU ABDULGANIYU"
                className={`w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${currentUser?.role === 'Contractor' ? 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 cursor-not-allowed' : ''}`}
                onChange={handleChange}
              />
              {currentUser?.role === 'Contractor' && (
                <p className="text-[10px] text-slate-400 mt-1">Bound to your account profile name</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Bid Amount (₦)</label>
              <input 
                type="number" 
                name="amount"
                required
                value={formData.amount}
                placeholder="8000000"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Duration (days)</label>
              <input 
                type="number" 
                name="duration"
                required
                value={formData.duration}
                placeholder="120"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Experience (years)</label>
              <input 
                type="number" 
                name="experience"
                required
                value={formData.experience}
                placeholder="3"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Quality Rating (0-100)</label>
              <input 
                type="number" 
                name="qualityScore"
                required
                value={formData.qualityScore}
                placeholder="75"
                min="0" max="100"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">On-Time Rate (0-1)</label>
              <input 
                type="number" 
                name="onTimeRate"
                required
                value={formData.onTimeRate}
                step="0.01"
                min="0" max="1"
                placeholder="0.85"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Past Disputes Count</label>
              <input 
                type="number" 
                name="pastDisputes"
                required
                value={formData.pastDisputes}
                min="0"
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => navigate('/dashboard')}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold py-2 px-4 rounded-xl transition-colors duration-200"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition-colors"
            >
              Submit Bid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBid;
