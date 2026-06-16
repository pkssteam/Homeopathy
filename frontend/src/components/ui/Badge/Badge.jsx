import React from 'react';

export const Badge = ({ children, variant = 'info', className = '', ...props }) => {
  const badgeClasses = {
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    gray: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold border rounded-full ${badgeClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
