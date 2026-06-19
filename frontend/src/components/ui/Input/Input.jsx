import React from 'react';
import './Input.css';

export const Input = ({ label, error, className = '', id, ...props }) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;
  return (
    <div className={`form-field-wrapper ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-field-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`form-field-input ${error ? 'has-error' : ''}`}
        {...props}
      />
      {error && <span className="form-field-error">{error}</span>}
    </div>
  );
};
