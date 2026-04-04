import React from 'react';

export default function Controls({ category, params, onChange, onStringChange }) {
  const handleRangeChange = (e) => {
    onChange(e.target.name, e.target.value);
  };
  const handleSelectChange = (e) => {
    onStringChange(e.target.name, e.target.value);
  };

  const renderSlider = (paramName, label, min, max, step, desc) => (
    <div className="param-group" key={paramName}>
      <div className="param-header">
        <span className="param-label">{label}</span>
        <span className="param-value">{params[paramName]}</span>
      </div>
      <input 
        type="range" 
        name={paramName} 
        min={min} max={max} step={step}
        value={params[paramName] || 0} 
        onChange={handleRangeChange} 
      />
      {desc && <div style={{fontSize: '0.75rem',marginTop:'4px', color: 'var(--text-muted)'}}>{desc}</div>}
    </div>
  );

  const renderSelect = (paramName, label, options, desc) => (
    <div className="param-group" key={paramName}>
      <div className="param-header">
        <span className="param-label">{label}</span>
      </div>
      <select 
        name={paramName} 
        className="custom-select" 
        value={params[paramName] || options[0].value} 
        onChange={handleSelectChange}
        style={{marginBottom: '0.5rem'}}
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {desc && <div style={{fontSize: '0.75rem',marginTop:'4px', color: 'var(--text-muted)'}}>{desc}</div>}
    </div>
  );

  switch (category) {
    case 'color_models':
      return (
        <div>
          <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem'}}>
            Analyze the image represented across different color spaces natively via mathematical transformations. No parameters.
          </div>
        </div>
      );
      
    case 'fourier_analysis':
      return (
        <div>
          {renderSlider('maskRadius', 'High-Pass Filter Radius', 1, 150, 1, 'Radius of the central circle masked (set to 0) in the frequency spectrum.')}
        </div>
      );

    case 'noise_reduction':
      return (
        <div>
          {renderSelect('noiseType', 'Types of Synthetic Noise', [
            {value: 'gaussian', label: 'Gaussian Noise'},
            {value: 'saltpepper', label: 'Salt & Pepper Noise'}
          ], 'Mathematical model used to corrupt the original signal.')}
          
          {renderSlider('noiseVariance', 'Noise Variance / Probability', 0, 0.5, 0.01, 'Intensity of the introduced noise artifacts.')}
          
          {renderSelect('filterType', 'Reduction Filter Kernel Algorithm', [
            {value: 'gaussian', label: 'Gaussian Blur'},
            {value: 'median', label: 'Median Filter'},
            {value: 'bilateral', label: 'Bilateral Filter (Edge-Preserving)'}
          ], 'Algorithm strategy used to smooth out local pixel anomalies.')}
          
          {renderSlider('kernelSize', 'Restoration Kernel Size', 3, 15, 2, 'Spatial extent of the window used for local averaging.')}
        </div>
      );

    case 'edge_detection':
      return (
        <div>
          {renderSlider('cannyMin', 'Canny Minimal Threshold', 0, 255, 1, 'Lower bound of hysteresis thresholding.')}
          {renderSlider('cannyMax', 'Canny Maximal Threshold', 0, 255, 1, 'Upper bound of hysteresis thresholding.')}
          {renderSlider('kernelSize', 'Gaussian Smoothing Kernel', 3, 15, 2, 'Kernel constraint applied before computing Laplacian.')}
        </div>
      );
      
    case 'corner_detection':
      return (
        <div>
          {renderSlider('blockSize', 'Neighborhood Size', 2, 8, 1, 'Size of neighbourhood considered for corner detection.')}
          {renderSlider('kSize', 'Aperture parameter (Sobel)', 3, 7, 2, 'Odd parameter indicating the Sobel derivative window.')}
          {renderSlider('kParam', 'Harris Free Parameter (k)', 0.01, 0.1, 0.01, 'Empirical constant k in the equation.')}
          {renderSlider('thresholdRatio', 'Detection Threshold Ratio', 0.01, 0.2, 0.01, 'Ratio of max eigenvalue used to cutoff weak corners.')}
        </div>
      );

    case 'feature_descriptors':
      return (
        <div>
          {renderSlider('nFeatures', 'Maximum Features (ORB)', 50, 2000, 50, 'Maximal number of invariant keypoints to extract.')}
        </div>
      );

    default:
      return <div>Select a valid category.</div>;
  }
}
