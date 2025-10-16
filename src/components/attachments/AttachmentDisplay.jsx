import React, { useState } from 'react';
import { X, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';

const AttachmentDisplay = ({ attachments, onRemove, readonly = false }) => {
  if (!attachments || attachments.length === 0) return null;

  // Separate images
  const images = attachments.filter(att => {
    const mime = att.mimeType?.toLowerCase() || '';
    const name = att.filename?.toLowerCase() || '';
    return mime.startsWith('image/') || /\.(jpg|jpeg|png|gif)$/i.test(name);
  });

  const [current, setCurrent] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleNext = () => setCurrent(prev => (prev + 1) % images.length);
  const handlePrev = () => setCurrent(prev => (prev - 1 + images.length) % images.length);

  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const handleDownload = (att) => {
    const a = document.createElement('a');
    a.href = att.downloadUrl || att.url;
    a.download = att.filename || 'download';
    a.setAttribute('target', '_blank');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
    const mime = att.mimeType || '';
    const name = att.filename?.toLowerCase() || '';
    return mime.startsWith('image/') || /\.(jpg|jpeg|png|gif)$/i.test(name);
  };

  return (
    <div className="mt-3">
      {/* 🖼️ Image Thumbnails */}
      <div className="flex flex-wrap gap-3">
        {images.map((att, idx) => (
          <img
            key={idx}
            src={att.url}
            alt={att.filename}
            className="w-32 h-32 object-cover rounded-lg border cursor-pointer"
            onClick={() => { setCurrent(idx); setIsFullScreen(true); }}
          />
        ))}
      </div>

      {/* Fullscreen Modal */}
      {isFullScreen && (
        <div
          {...handlers}
          className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50"
        >
          <button
            onClick={() => setIsFullScreen(false)}
            className="absolute top-5 right-5 text-white p-2 rounded-full bg-black/50 hover:bg-black/70"
          >
            <X className="w-6 h-6" />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-5 text-white p-2 rounded-full bg-black/50 hover:bg-black/70"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-5 text-white p-2 rounded-full bg-black/50 hover:bg-black/70"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <img
            src={images[current].url}
            alt={images[current].filename}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          />
          <div className="absolute bottom-5 text-white text-sm">
            {current + 1} / {images.length}
          </div>
        </div>
      )}

      {/* Non-image attachments */}
      <div className="flex flex-wrap gap-3 mt-4">
        {attachments.map((att, idx) => !isActuallyImage(att) && (
          <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border hover:border-indigo-400 shadow-sm min-w-[200px]">
            <span className="text-2xl">{getFileIcon(att)}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{att.filename}</div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => handleView(att)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> View
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => handleDownload(att)}
                  className="text-xs text-green-600 hover:text-green-700 font-medium hover:underline flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Download
                </button>
                {!readonly && (
                  <>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => onRemove(idx)}
                      className="text-red-500 hover:text-red-700 ml-1 p-1 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttachmentDisplay;
