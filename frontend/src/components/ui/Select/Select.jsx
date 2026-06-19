import React from 'react';
import './Select.css';

export const Select = ({ label, options = [], children, error, className = '', id, ...props }) => {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 11)}`;
  return (
    <div className={`form-field-wrapper ${className}`}>
      {label && (
        <label htmlFor={selectId} className="form-field-label">
          {label}
        </label>
      )}
      <div className="form-select-container">
        <select
          id={selectId}
          className={`form-field-select ${error ? 'has-error' : ''}`}
          {...props}
        >
          {children ? children : options.map((opt, index) => (
            <option key={index} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="form-select-arrow">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
      {error && <span className="form-field-error">{error}</span>}
    </div>
  );
};
