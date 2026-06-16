import React from 'react';

export const Input = ({ label, error, className = '', id, ...props }) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`px-3 py-2 text-sm border bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-medical-500 focus:border-medical-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all ${
          error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
    </div>
  );
};
