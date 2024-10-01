import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isProtected: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, isProtected }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/verify-token', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          throw new Error('Token verification failed');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  }, []);  // Empty dependency array

  if (isAuthenticated === null) {
    // Still checking authentication
    return <div>Loading...</div>;
  }

  if (isProtected && !isAuthenticated) {
    // Redirect to login if trying to access a protected route while not authenticated
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (!isProtected && isAuthenticated) {
    // Redirect to home if trying to access login while already authenticated
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;