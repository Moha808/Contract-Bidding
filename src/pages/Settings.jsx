import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Eye, Lock, Globe } from 'lucide-react';

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-6">
      <div className="glass-panel p-8">
        <div className="mb-8 pb-4 border-b border-slate-100">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-primary-500" /> Account Settings
          </h2>
          <p className="text-slate-500 mt-1">Manage configuration preferences for the bidding system</p>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-100">
            <div className="flex gap-4 items-start">
              <div className="bg-slate-100 p-2 rounded-xl text-slate-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Email Notifications</h3>
                <p className="text-sm text-slate-500">Receive alerts when bids are evaluated or projects are posted</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={notifications} 
                onChange={() => setNotifications(!notifications)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Interface Language */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-100">
            <div className="flex gap-4 items-start">
              <div className="bg-slate-100 p-2 rounded-xl text-slate-600">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">System Language</h3>
                <p className="text-sm text-slate-500">Select default display language</p>
              </div>
            </div>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="en">English (US)</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
          </div>

          {/* Security / Password reset placeholder */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex gap-4 items-start">
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-600 dark:text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Security Credentials</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Update your sign-in password and authentication locks</p>
              </div>
            </div>
            <button className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
              Change Password
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
