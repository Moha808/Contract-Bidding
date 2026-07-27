import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Award } from 'lucide-react';

const Profile = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    organization: 'Adamawa State University',
    phone: '+234 801 234 5678'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-6">
      <div className="glass-panel p-8">
        <div className="flex flex-col md:flex-row gap-6 items-center pb-8 border-b border-slate-100">
          <div className="w-24 h-24 rounded-3xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-3xl shadow-inner">
            {currentUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-black text-slate-800">{currentUser?.name}</h2>
            <p className="text-slate-500 font-medium capitalize mt-1">{currentUser?.role}</p>
            <div className="flex gap-2 justify-center md:justify-start mt-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Active Member
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="btn-secondary"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); setIsEditing(false); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> Full Name
              </label>
              <input 
                type="text" 
                name="name"
                disabled={!isEditing}
                value={formData.name}
                onChange={handleChange}
                className="input-field disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" /> Email Address
              </label>
              <input 
                type="email" 
                name="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={handleChange}
                className="input-field disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" /> Role Designation
              </label>
              <input 
                type="text" 
                disabled
                value={currentUser?.role}
                className="input-field bg-slate-50 text-slate-500 cursor-not-allowed capitalize"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-slate-400" /> Organization
              </label>
              <input 
                type="text" 
                name="organization"
                disabled={!isEditing}
                value={formData.organization}
                onChange={handleChange}
                className="input-field disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
