import React, { useState } from 'react';
import { Upload, Loader } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { isCloudinaryConfigured } from '../../config/cloudinary';

const AttachmentUploader = ({ onUpload }) => {
  const { uploadFile } = useData();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!isCloudinaryConfigured()) {
      alert('Cloudinary is not configured! Please add your cloud name and upload preset.');
      return;
    }
    
    setUploading(true);
    try {
      const result = await uploadFile(file);
      if (result) {
        onUpload(result);
      }
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <label className={`inline-flex items-center gap-2 px-3 py-1 text-sm rounded cursor-pointer ${
      uploading ? 'bg-gray-300' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
    }`}>
      {uploading ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          Uploading
        </>
      ) : (
        <>
          <Upload className="w-4 h-4" />
          Attach
        </>
      )}
      <input 
        type="file" 
        className="hidden" 
        onChange={handleFileChange} 
        accept="image/*,.pdf,.doc,.docx,.txt" 
        disabled={uploading} 
      />
    </label>
  );
};

export default AttachmentUploader; 