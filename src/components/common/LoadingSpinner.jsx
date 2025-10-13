import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader className="w-12 h-12 text-indigo-600 animate-spin" />
  </div>
);

export default LoadingSpinner;