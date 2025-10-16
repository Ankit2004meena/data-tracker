import React, { useState } from 'react';
import { Upload, Loader, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { isCloudinaryConfigured } from '../../config/cloudinary';

const AttachmentUploader = ({ onUpload }) => {
  const { uploadFile } = useData();
  const [uploadingFiles, setUploadingFiles] = useState([]); // files being uploaded
  const [uploadedFiles, setUploadedFiles] = useState([]);   // successfully uploaded

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (!isCloudinaryConfigured()) {
      alert('Cloudinary is not configured! Please add your cloud name and upload preset.');
      return;
    }

    const newUploads = files.map(file => ({
      file,
      progress: 0,
      status: 'uploading', // uploading | done | error
    }));
    setUploadingFiles(prev => [...prev, ...newUploads]);
    e.target.value = '';

    // Upload all files
    await Promise.all(newUploads.map(async (item, index) => {
      try {
        const result = await uploadFile(item.file, (prog) => {
          // optional progress callback
          setUploadingFiles(prev => {
            const copy = [...prev];
            copy[prev.length - newUploads.length + index].progress = prog;
            return copy;
          });
        });
        if (result) {
          onUpload(result); // parent handles uploaded file
          setUploadedFiles(prev => [...prev, item.file]);
        }
        setUploadingFiles(prev => {
          const copy = [...prev];
          copy[prev.length - newUploads.length + index].status = 'done';
          copy[prev.length - newUploads.length + index].progress = 100;
          return copy;
        });
      } catch {
        setUploadingFiles(prev => {
          const copy = [...prev];
          copy[prev.length - newUploads.length + index].status = 'error';
          return copy;
        });
      }
    }));
  };

  const removeUploadingFile = (index) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded cursor-pointer bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
        <Upload className="w-4 h-4" />
        Attach
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.txt"
          multiple
        />
      </label>

      {/* Uploading files */}
      {uploadingFiles.filter(f => f.status === 'uploading').length > 0 && (
        <div className="space-y-1">
          {uploadingFiles.filter(f => f.status === 'uploading').map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="flex-1 truncate">{item.file.name}</span>
              <span className="flex items-center gap-1 text-indigo-500">
                <Loader className="w-4 h-4 animate-spin" />
                {item.progress > 0 ? `${item.progress}%` : 'Uploading'}
              </span>
              <button onClick={() => removeUploadingFile(index)}>
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-1">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-green-600">
              <span className="flex-1 truncate">{file.name}</span>
              <span>✔</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttachmentUploader;
