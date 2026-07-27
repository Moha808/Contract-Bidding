import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const NewProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    category: '',
    deadline: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await addDoc(collection(db, 'projects'), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      navigate('/dashboard');
    } catch (error) {
      console.error("Error adding project: ", error);
      alert("Failed to create project");
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="glass-panel p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Create Project</h2>
          <p className="text-slate-500 mt-1">Publish a new contract bidding opportunity</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input 
              type="text" 
              name="title"
              required
              placeholder="e.g. Construction of 2 Nos Class Rooms"
              className="input-field"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              name="description"
              required
              rows="4"
              placeholder="Provide detailed requirements for this project..."
              className="input-field resize-none"
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Budget (₦)</label>
              <input 
                type="number" 
                name="budget"
                required
                min="0"
                placeholder="9000000"
                className="input-field"
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <input 
                type="text" 
                name="category"
                required
                placeholder="e.g. building"
                className="input-field"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deadline (days)</label>
            <input 
              type="number" 
              name="deadline"
              required
              min="1"
              placeholder="35"
              className="input-field"
              onChange={handleChange}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
            >
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProject;
