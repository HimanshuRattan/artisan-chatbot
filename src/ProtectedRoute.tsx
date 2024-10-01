import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from './Home';

function ProtectedRoute() {
// export const ProtectedRoute = () => {
  // const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Hopefully you are not here. 😬");
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      // if (!token) {
      //   setIsAuthenticated(false);
      //   return;
      // }

      // try {
      //   const response = await fetch('http://localhost:8000/verify-token', {
      //     headers: {
      //       'Authorization': `Bearer ${token}`
      //     }
      //   });

      //   if (response.ok) {
      //     setIsAuthenticated(true);
      //   } else {
      //     throw new Error('Token verification failed');
      //   }
      // } catch (error) {
      //   console.error('Token verification failed:', error);
      //   localStorage.removeItem('token');
      //   setIsAuthenticated(false);
      // }

      try {
        const response = await fetch('http://localhost:8000/verify-token', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Token verification failed');
        } 
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        navigate('/');
      }
    };

    verifyToken();
  }, [navigate]);

  return (
      <Home />
  )



  // return { isAuthenticated, setIsAuthenticated };
};

export default ProtectedRoute;