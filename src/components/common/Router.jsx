import React, { useState, useEffect } from 'react';

const Router = ({ children }) => {
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/');
  
  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  const navigate = (path) => { 
    window.location.hash = path; 
  };
  
  return children({ route, navigate });
};

export default Router;