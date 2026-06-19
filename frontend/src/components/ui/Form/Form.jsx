import React from 'react';
import './Form.css';

export const Form = ({ onSubmit, children, className = '', error, ...props }) => {
  return (
    <form onSubmit={onSubmit} className={`custom-form ${className}`} {...props}>
      {error && (
        <div className="form-error-summary">
          {error}
        </div>
      )}
      {children}
    </form>
  );
};

export const FormGroup = ({ children, className = '' }) => {
  return (
    <div className={`custom-form-group ${className}`}>
      {children}
    </div>
  );
};

export const FormActions = ({ children, className = '' }) => {
  return (
    <div className={`custom-form-actions ${className}`}>
      {children}
    </div>
  );
};
