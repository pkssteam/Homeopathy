import React from 'react';
import './Form.css';

export const Form = ({ onSubmit, children, className = '', error, ...props }) => {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`} {...props}>
      {error && (
        <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded font-medium">
          {error}
        </div>
      )}
      {children}
    </form>
  );
};

export const FormGroup = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      {children}
    </div>
  );
};

export const FormActions = ({ children, className = '' }) => {
  return (
    <div className={`pt-4 border-t border-slate-200 flex justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
};
