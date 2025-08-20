import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

  return <>{children}</>;
};