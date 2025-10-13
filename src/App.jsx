import React from 'react';
import { DataProvider } from './context/DataContext';
import { Router, Navbar } from './components';
import HomePage from './pages/HomePage';
import SOPViewPage from './pages/SOPViewPage';
import SOPEditPage from './pages/SOPEditPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <DataProvider>
      <Router>
        {({ route, navigate }) => {
          const routeParts = route.split('/');
          return (
            <div className="min-h-screen bg-gray-50">
              <Navbar navigate={navigate} currentRoute={route} />
              {route === '/' && <HomePage navigate={navigate} />}
              {route.startsWith('/sop/') && <SOPViewPage sopId={routeParts[2]} navigate={navigate} />}
              {route.startsWith('/edit/') && <SOPEditPage sopId={routeParts[2]} navigate={navigate} />}
              {route === '/admin' && <AdminPage navigate={navigate} />}
            </div>
          );
        }}
      </Router>
    </DataProvider>
  );
}