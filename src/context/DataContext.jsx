import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { CLOUDINARY_CLOUD_NAME } from '../config/cloudinary';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const sops = await api.getSOPs();
      setData(sops);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addSOP = async (sop) => {
    try {
      await api.createSOP(sop);
      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateSOP = async (sopId, updates) => {
    try {
      await api.updateSOP(sopId, updates);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteSOP = async (sopId) => {
    try {
      await api.deleteSOP(sopId);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const uploadFile = async (file) => {
    const result = await api.uploadToCloudinary(file);
    const isImage = file.type.startsWith('image/');
    
    let downloadUrl = result.secure_url;
    if (!isImage && result.public_id) {
      downloadUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload/fl_attachment/${result.public_id}`;
    }
    
    return {
      url: result.secure_url,
      downloadUrl: downloadUrl,
      filename: file.name,
      type: isImage ? 'image' : 'file',
      publicId: result.public_id,
      mimeType: file.type
    };
  };

  const importData = async (newData) => {
    try {
      await api.importData(newData);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const seedDatabase = async () => {
    try {
      await api.seedData();
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DataContext.Provider value={{ 
      data, 
      loading, 
      error, 
      fetchData, 
      addSOP, 
      updateSOP, 
      deleteSOP, 
      uploadFile, 
      importData, 
      seedDatabase 
    }}>
      {children}
    </DataContext.Provider>
  );
};