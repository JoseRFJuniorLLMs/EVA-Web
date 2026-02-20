import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'technician' | 'doctor' | 'admin';
  allowedRoles?: ('technician' | 'doctor' | 'admin')[];
}

export function ProtectedRoute({ children, requiredRole, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (user.role !== 'admin') {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role) && user.role !== 'admin') {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}

// Higher-order component for admin-only routes
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
}

// Higher-order component for doctor or admin routes
export function DoctorRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['doctor', 'admin']}>
      {children}
    </ProtectedRoute>
  );
}
