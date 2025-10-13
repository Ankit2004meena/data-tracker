import React from 'react';
import { X, Eye, Download } from 'lucide-react';

const AttachmentDisplay = ({ attachments, onRemove, readonly = false }) => {
  if (!attachments || attachments.length === 0) return null;
  
  const handleDownload = async (att) => {
    try {
      const downloadLink = att.downloadUrl || att.url;
      const a = document.createElement('a');
      a.href = downloadLink;
      a.download = att.filename || 'download';
      a.setAttribute('target', '_blank');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      window.open(att.downloadUrl || att.url, '_blank');
    }
  };

  const handleView = (att) => {
    const name = att.filename?.toLowerCase() || '';
    const isPDF = att.mimeType?.includes('pdf') || name.endsWith('.pdf');
    
    if (isPDF) {
      const viewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(att.url)}&embedded=true`;
      window.open(viewUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(att.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getFileIcon = (att) => {
    const name = att.filename?.toLowerCase() || '';
    const mime = att.mimeType?.toLowerCase() || '';
    
    if (mime.includes('pdf') || name.endsWith('.pdf')) return '📄';
    if (mime.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return '📝';
    if (mime.includes('sheet') || mime.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx')) return '📊';
    if (mime.includes('text') || name.endsWith('.txt')) return '📃';
    if (mime.includes('zip') || mime.includes('rar') || name.endsWith('.zip') || name.endsWith('.rar')) return '🗜️';
    return '📎';
  };

  const isActuallyImage = (att) => {
    if (att.mimeType && att.mimeType.startsWith('image/')) return true;
    if (att.type === 'image') {
      const name = att.filename?.toLowerCase() || '';
      if (name.endsWith('.pdf') || name.endsWith('.doc') || name.endsWith('.docx')) return false;
      return true;
    }
    return false;
  };
  
  return (
    <div className="flex flex-wrap gap-3 mt-3">
      {attachments.map((att, idx) => (
        <div key={idx} className="relative group">
          {isActuallyImage(att) ? (
            <div className="relative">
              <img 
                src={att.url} 
                alt={att.filename} 
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-indigo-400 transition-all shadow-sm hover:shadow-md" 
                onClick={() => window.open(att.url, '_blank')}
                title="Click to view full size"
              />
              {!readonly && (
                <button 
                  onClick={() => onRemove(idx)} 
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                  title="Remove attachment"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 transition-all shadow-sm hover:shadow-md min-w-[200px]">
              <span className="text-2xl">{getFileIcon(att)}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate" title={att.filename}>
                  {att.filename}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => handleView(att)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline flex items-center gap-1"
                    title="View in browser"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => handleDownload(att)}
                    className="text-xs text-green-600 hover:text-green-700 font-medium hover:underline flex items-center gap-1"
                    title="Download file"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => window.open(att.url, '_blank')}
                    className="text-xs text-gray-600 hover:text-gray-700 font-medium hover:underline"
                    title="Open direct link"
                  >
                    Direct
                  </button>
                </div>
              </div>
              {!readonly && (
                <button 
                  onClick={() => onRemove(idx)} 
                  className="text-red-500 hover:text-red-700 ml-2 p-1 hover:bg-red-50 rounded transition-colors"
                  title="Remove attachment"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AttachmentDisplay;