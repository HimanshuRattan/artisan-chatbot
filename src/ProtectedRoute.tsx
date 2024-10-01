import { useState, useEffect } from 'react';
import { useNavigate, Navigate  } from 'react-router-dom';
import Home from './Home';

function ProtectedRoute() {
// export const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Hopefully you are not here. 😬");
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

        if (!response.ok) {
          throw new Error('Token verification failed');
        } 
        else {
          console.log("all good")
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/');
      }
    };

    verifyToken();
  }, [navigate]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; 
  }

  return (
    isAuthenticated ? <Home /> : <Navigate to="/" replace />

  )

};

export default ProtectedRoute;