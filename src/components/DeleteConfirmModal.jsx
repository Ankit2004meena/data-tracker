import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

const DeleteConfirmModal = ({ sopName, onCancel, onConfirm }) => {
  const [input, setInput] = useState('');

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-lg relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-900">Confirm Deletion</h2>
        <p className="text-gray-700 mb-4">
          To delete <strong>{sopName}</strong>, please type its name below:
        </p>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg p-2 mb-4"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type SOP name"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(input)}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteConfirmModal;
