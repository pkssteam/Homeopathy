import React from 'react';

export const EmptyState = ({ title = 'No records found', message = 'There is no data to display at this time.' }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 w-full border border-dashed border-slate-200 rounded bg-slate-50/50 min-h-[180px]">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">{message}</p>
    </div>
  );
};
