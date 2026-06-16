import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import { ProtectedRoute } from './ProtectedRoute';
import { Login } from '../pages/Login';
import { AdminDashboard } from '../pages/AdminDashboard';
import { DoctorDashboard } from '../pages/DoctorDashboard';
import { PatientDashboard } from '../pages/PatientDashboard';
import { InventoryDashboard } from '../pages/InventoryDashboard';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<Login />} />
      
      <Route 
        path={ROUTES.ADMIN_DASHBOARD} 
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.DOCTOR_DASHBOARD} 
        element={
          <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}>
            <DoctorDashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.PATIENT_DASHBOARD} 
        element={
          <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
            <PatientDashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.INVENTORY_DASHBOARD} 
        element={
          <ProtectedRoute allowedRoles={[ROLES.INVENTORY_REP]}>
            <InventoryDashboard />
          </ProtectedRoute>
        } 
      />

      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
};
