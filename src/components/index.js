// Method 1: Individual imports with error handling
import LoadingSpinner from './common/LoadingSpinner';
import Router from './common/Router';
import Navbar from './common/Navbar';
// components/index.js
export { default as AttachmentDisplay } from './attachments/AttachmentDisplay';
export { default as AttachmentUploader } from './attachments/AttachmentUploader';

// import AttachmentUploader from './attachments/attachmentUploader';
// import AttachmentDisplay from './attachments/AttachmentDisplay';

export {
  LoadingSpinner,
  Router,
  Navbar,

};