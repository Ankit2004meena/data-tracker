const API_BASE_URL = 'https://data-tracker-backend.vercel.app/api';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../config/cloudinary';

const api = {
  async getSOPs() {
    const res = await fetch(`${API_BASE_URL}/sops`);
    if (!res.ok) throw new Error('Failed to fetch SOPs');
    return res.json();
  },

  async createSOP(data) {
    const res = await fetch(`${API_BASE_URL}/sops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create SOP');
    }
    return res.json();
  },

  async updateSOP(id, data) {
    const res = await fetch(`${API_BASE_URL}/sops/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update SOP');
    return res.json();
  },

  async deleteSOP(id) {
    const res = await fetch(`${API_BASE_URL}/sops/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete SOP');
    return res.json();
  },

  async uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    const isImage = file.type.startsWith('image/');
    const endpoint = isImage 
      ? `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
      : `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`;
    
    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to upload');
    return res.json();
  },

  async importData(data) {
    const res = await fetch(`${API_BASE_URL}/sops/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to import');
    return res.json();
  },

  async seedData() {
    const res = await fetch(`${API_BASE_URL}/seed`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to seed');
    return res.json();
  }
};

export default api;