import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-medical-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const redirects = {
      ADMIN: ROUTES.ADMIN_DASHBOARD,
      DOCTOR: ROUTES.DOCTOR_DASHBOARD,
      PATIENT: ROUTES.PATIENT_DASHBOARD,
      INVENTORY_REP: ROUTES.INVENTORY_DASHBOARD
    };
    return <Navigate to={redirects[user.role] || ROUTES.LOGIN} replace />;
  }

  return children;
};
