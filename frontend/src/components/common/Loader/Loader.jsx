import React from 'react';

export const Loader = ({ message = 'Loading records...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-medical-600"></div>
      <p className="mt-3 text-sm text-slate-500 font-medium">{message}</p>
    </div>
  );
};
