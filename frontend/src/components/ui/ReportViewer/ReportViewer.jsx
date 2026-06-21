import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';
import './ReportViewer.css';

export const ReportViewer = ({ isOpen, onClose, reportUrl, reportName }) => {
  const [scale, setScale] = useState(1.0);
  
  if (!isOpen || !reportUrl) return null;

  // Format the file URL safely
  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `http://localhost:8000${url}`;
  };

  const fullUrl = getFullUrl(reportUrl);
  const isImage = /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(fullUrl);
  const isPdf = /\.pdf$/i.test(fullUrl);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => setScale(1.0);

  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', reportName || 'report');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download report:', err);
      // Fallback
      window.open(fullUrl, '_blank');
    }
  };

  return createPortal(
    <div className="report-viewer-overlay animate-fade-in" onClick={onClose}>
      <div className="report-viewer-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="report-viewer-header">
          <div className="report-viewer-title-info">
            <h3 className="report-viewer-title">{reportName || 'View Report'}</h3>
            <span className="report-viewer-subtitle">{isPdf ? 'PDF Document' : isImage ? 'Image File' : 'Medical File'}</span>
          </div>

          <div className="report-viewer-actions">
            {/* Direct Download */}
            <button 
              onClick={handleDownload} 
              className="report-action-btn hover:bg-emerald-50 hover:text-emerald-600" 
              title="Download File"
            >
              <Download size={16} />
            </button>

            {/* Custom Zoom Controls (For Images) */}
            {isImage && (
              <>
                <button 
                  onClick={handleZoomOut} 
                  className="report-action-btn" 
                  title="Zoom Out"
                  disabled={scale <= 0.5}
                >
                  <ZoomOut size={16} />
                </button>
                <span className="report-zoom-indicator">{Math.round(scale * 100)}%</span>
                <button 
                  onClick={handleZoomIn} 
                  className="report-action-btn" 
                  title="Zoom In"
                  disabled={scale >= 3.0}
                >
                  <ZoomIn size={16} />
                </button>
                <button 
                  onClick={handleReset} 
                  className="report-action-btn" 
                  title="Reset Zoom"
                >
                  <RotateCcw size={16} />
                </button>
              </>
            )}

            {/* Close */}
            <button 
              onClick={onClose} 
              className="report-action-btn report-close-btn hover:bg-red-50 hover:text-red-600" 
              title="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="report-viewer-body">
          {isImage ? (
            <div className="image-viewport-container">
              <img 
                src={fullUrl} 
                alt={reportName} 
                className="report-viewer-image"
                style={{ 
                  transform: `scale(${scale})`, 
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)' 
                }} 
              />
            </div>
          ) : isPdf ? (
            <iframe 
              src={`${fullUrl}#toolbar=1&navpanes=0`}
              title={reportName} 
              className="report-viewer-iframe"
            />
          ) : (
            <div className="unsupported-format-container">
              <div className="text-center p-8">
                <p className="text-slate-600 font-bold mb-3">No direct browser preview available for this format.</p>
                <button 
                  onClick={handleDownload}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg inline-flex items-center gap-2 text-xs"
                >
                  <Download size={14} />
                  <span>Download File to View</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
