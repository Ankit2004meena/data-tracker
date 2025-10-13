import React, { useState } from 'react';
import { Home, Plus, Trash2, Download, Upload } from 'lucide-react';
import { useData } from '../context/DataContext';

const AdminPage = ({ navigate }) => {
  const { data, addSOP, deleteSOP, importData } = useData();
  const [name, setName] = useState('');
  const [notif, setNotif] = useState(null);

  const notify = (msg, type = 'success') => {
    setNotif({ message: msg, type });
    setTimeout(() => setNotif(null), 3000);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      notify('Name required', 'error');
      return;
    }
    const res = await addSOP({ id: `sop-${Date.now()}`, name, steps: [] });
    if (res.success) {
      setName('');
      notify('Created!');
    } else {
      notify(res.error, 'error');
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sop-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    notify('Exported!');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (window.confirm('Replace all data?')) {
          await importData(imported);
          notify('Imported!');
        }
      } catch (err) {
        notify('Import failed', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {notif && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg ${notif.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {notif.message}
        </div>
      )}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button onClick={() => navigate('/')} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <Home className="w-5 h-5 mr-2" />Back to Home
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Admin Panel</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Create New SOP</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="SOP name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAdd}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />Add SOP
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Manage SOPs</h2>
          <div className="space-y-2">
            {data.map(sop => (
              <div key={sop.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{sop.name}</div>
                  <div className="text-sm text-gray-500">{sop.steps?.length || 0} steps</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/edit/${sop.id}`)}
                    className="text-indigo-600 hover:text-indigo-700 px-3 py-1 rounded hover:bg-indigo-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Delete SOP "${sop.name}"?`)) {
                        await deleteSOP(sop.id);
                        notify('SOP deleted!');
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4">Import/Export Data</h2>
          <div className="space-y-4">
            <div>
              <button
                onClick={handleExport}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />Export Data as JSON
              </button>
              <p className="text-sm text-gray-500 mt-2">Download all your data as a JSON file for backup</p>
            </div>
            <div>
              <label className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-5 h-5" />Import Data from JSON
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
              <p className="text-sm text-gray-500 mt-2">Upload a JSON file to replace current data</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800"><strong>Warning:</strong> Importing will replace all current data. Make sure to export first!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;