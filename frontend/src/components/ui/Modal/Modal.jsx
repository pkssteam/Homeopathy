import React from 'react';
import { X } from 'lucide-react';
import './Modal.css';

export const Modal = ({ isOpen, onClose, title, icon: IconComponent, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl border border-slate-250 max-h-[90vh] flex flex-col animate-scale-in">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
            {IconComponent && <IconComponent size={18} className="text-medical-600" />}
            <span>{title}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
