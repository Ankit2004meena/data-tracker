import React, { useState } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { LoadingSpinner } from '../components';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const HomePage = ({ navigate }) => {
  const { data, loading, seedDatabase, deleteSOP } = useData();
  const [modalSOP, setModalSOP] = useState(null); // SOP pending deletion

  if (loading) return <LoadingSpinner />;

  const handleConfirmDelete = (input) => {
    if (input === modalSOP.name) {
      deleteSOP(modalSOP.id);
      setModalSOP(null);
    } else {
      alert('SOP name did not match. Deletion cancelled.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">SOP Builder</h1>
          <p className="text-xl text-gray-600">Standard Operating Procedures</p>
        </div>

        {data.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No SOPs Yet</h3>
            <div className="flex gap-4 justify-center mt-6">
              <button 
                onClick={seedDatabase} 
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
              >
                Seed Sample
              </button>
              <button 
                onClick={() => navigate('/admin')} 
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
              >
                Create New
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((sop) => (
              <div key={sop.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{sop.name}</h2>
                  <FileText className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="text-sm text-gray-600 mb-4">{sop.steps?.length || 0} steps</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/sop/${sop.id}`)} 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => navigate(`/edit/${sop.id}`)} 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => setModalSOP(sop)} 
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {modalSOP && (
          <DeleteConfirmModal
            sopName={modalSOP.name}
            onCancel={() => setModalSOP(null)}
            onConfirm={handleConfirmDelete}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
