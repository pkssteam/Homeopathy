import React from 'react';

export const Select = ({ label, options = [], error, className = '', id, ...props }) => {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 11)}`;
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`px-3 py-2 text-sm border bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-medical-500 focus:border-medical-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all ${
          error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
        }`}
        {...props}
      >
        {options.map((opt, index) => (
          <option key={index} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
    </div>
  );
};
