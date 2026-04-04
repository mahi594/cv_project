import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

export default function ImageUploader({ onUpload, currentFile }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  }, [onUpload]);

  const handleChange = function(e) {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <label 
      className={`upload-wrapper ${dragActive ? 'drag-active' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      style={{ display: 'flex' }}
    >
      <input 
        type="file" 
        accept="image/*"
        onChange={handleChange} 
        style={{ display: 'none' }} 
      />
      
      <div className="upload-icon-circle">
        <Upload size={28} />
      </div>
      
      <div>
        <div className="upload-text-main">
          {currentFile ? currentFile.name : "Click or drag to upload"}
        </div>
        {!currentFile && <div className="upload-text-sub">PNG, JPG, up to 10MB</div>}
      </div>
    </label>
  );
}
