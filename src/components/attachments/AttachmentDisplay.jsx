import React, { useState } from 'react';
import { X, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';

const AttachmentDisplay = ({ attachments, onRemove, readonly = false }) => {
  if (!attachments || attachments.length === 0) return null;

  // 🔹 Identify images
  const imageAttachments = attachments.filter(att => {
    const mime = att.mimeType?.toLowerCase() || '';
    const name = att.filename?.toLowerCase() || '';
    return (
      mime.startsWith('image/') ||
      (!mime && (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.gif')))
    );
  });

  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    setCurrent(prev => (prev + 1) % imageAttachments.length);
  };

  const handlePrev = () => {
    setCurrent(prev => (prev - 1 + imageAttachments.length) % imageAttachments.length);
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

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
    const mime = att.mimeType || '';
    const name = att.filename?.toLowerCase() || '';
    return mime.startsWith('image/') || /\.(jpg|jpeg|png|gif)$/i.test(name);
  };

  return (
    <div className="mt-3">
      {/* 🖼️ Image carousel with swipe support */}
      {imageAttachments.length > 0 && (
        <div
          {...handlers}
          className="relative w-full flex justify-center items-center bg-black/5 rounded-lg overflow-hidden mb-4"
        >
          <img
            src={imageAttachments[current].url}
            alt={imageAttachments[current].filename}
            className="max-h-96 w-auto object-contain rounded-lg"
          />
          {imageAttachments.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 bg-white/70 hover:bg-white text-gray-800 rounded-full p-2 shadow-md"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 bg-white/70 hover:bg-white text-gray-800 rounded-full p-2 shadow-md"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                {current + 1} / {imageAttachments.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* 📂 Other attachments list */}
      <div className="flex flex-wrap gap-3">
        {attachments.map((att, idx) => (
          !isActuallyImage(att) && (
            <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 transition-all shadow-sm hover:shadow-md min-w-[200px]">
              <span className="text-2xl">{getFileIcon(att)}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate" title={att.filename}>
                  {att.filename}
                </div>
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
          )
        ))}
      </div>
    </div>
  );
};

export default AttachmentDisplay;
