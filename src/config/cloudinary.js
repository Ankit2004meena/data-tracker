// Cloudinary configuration
export const CLOUDINARY_CLOUD_NAME = 'dvgjzeg0l';
export const CLOUDINARY_UPLOAD_PRESET = 'sop_uploads';

// Helper to check if Cloudinary is configured
export const isCloudinaryConfigured = () => 
  CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here';