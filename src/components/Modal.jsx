import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Modal = ({ isOpen, onClose, type = 'info', title, message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  const config = {
    success: {
      icon: <CheckCircle className="w-10 h-10 text-green-500" />,
      ring: 'ring-green-100 dark:ring-green-900/30',
      bg: 'bg-green-50 dark:bg-green-950/20',
      btn: 'bg-green-600 hover:bg-green-500 text-white',
    },
    error: {
      icon: <XCircle className="w-10 h-10 text-red-500" />,
      ring: 'ring-red-100 dark:ring-red-900/30',
      bg: 'bg-red-50 dark:bg-red-950/20',
      btn: 'bg-red-600 hover:bg-red-500 text-white',
    },
    confirm: {
      icon: <AlertTriangle className="w-10 h-10 text-amber-500" />,
      ring: 'ring-amber-100 dark:ring-amber-900/30',
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      btn: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    },
    info: {
      icon: <Info className="w-10 h-10 text-indigo-500" />,
      ring: 'ring-indigo-100 dark:ring-indigo-900/30',
      bg: 'bg-indigo-50 dark:bg-indigo-950/20',
      btn: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    },
  };

  const { icon, ring, bg, btn } = config[type] || config.info;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={type !== 'confirm' ? onClose : undefined}
      />
      <div className={`relative w-full max-w-md rounded-3xl shadow-2xl ring-4 ${ring} bg-white dark:bg-slate-900 p-8 animate-in zoom-in-95 duration-200`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center text-center gap-4">
          <div className={`p-4 rounded-2xl ${bg}`}>{icon}</div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{title}</h3>
            {message && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{message}</p>}
          </div>
          {type === 'confirm' ? (
            <div className="flex gap-3 w-full mt-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                {cancelText}
              </button>
              <button onClick={() => { onConfirm?.(); onClose(); }} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors ${btn}`}>
                {confirmText}
              </button>
            </div>
          ) : (
            <button onClick={onClose} className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors mt-2 ${btn}`}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;

