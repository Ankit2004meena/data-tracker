import React from 'react';
import { FileText, Home, Settings } from 'lucide-react';

const Navbar = ({ navigate, currentRoute }) => {
  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-xl font-bold text-indigo-600"
          >
            <FileText className="w-6 h-6" />
            SOP Builder
          </button>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/')} 
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentRoute === '/' || currentRoute.startsWith('/sop') || currentRoute.startsWith('/edit') 
                  ? 'bg-indigo-100 text-indigo-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/admin')} 
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentRoute === '/admin' 
                  ? 'bg-indigo-100 text-indigo-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;