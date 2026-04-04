import React from 'react';

export default function PipelineVisualizer({ images, loading }) {
  if (!images || !Array.isArray(images)) return null;

  return (
    <div className="stage-grid" style={{position: 'relative'}}>
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      
      {images.map((imgObj, index) => {
        const isFinal = index === images.length - 1 && images.length > 2;
        return (
          <div key={index} className={`stage-card ${isFinal ? 'final' : ''}`}>
            <div className="stage-header">
              <div 
                className="stage-number" 
                style={isFinal ? {background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)'} : {}}
              >
                {index + 1}
              </div>
              <span className={`stage-title ${isFinal ? 'gradient-text' : ''}`} style={isFinal ? {fontSize: '1.2rem', fontWeight: 900} : {}}>
                {imgObj.title}
              </span>
            </div>
            <div className="stage-image">
              <img src={imgObj.data} alt={imgObj.title} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
