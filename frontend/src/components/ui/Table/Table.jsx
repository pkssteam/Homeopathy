import React from 'react';

export const Table = ({ headers = [], children, className = '', ...props }) => {
  return (
    <div className={`w-full overflow-x-auto border border-slate-200 rounded bg-white ${className}`}>
      <table className="w-full text-left border-collapse" {...props}>
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
          {children}
        </tbody>
      </table>
    </div>
  );
};
