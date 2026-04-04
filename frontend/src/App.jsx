import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Settings, Image as ImageIcon, BookOpen } from 'lucide-react';
import './index.css';

// Components
import ImageUploader from './components/ImageUploader';
import Controls from './components/Controls';
import PipelineVisualizer from './components/PipelineVisualizer';
import MetricsDisplay from './components/MetricsDisplay';

const API_URL = 'http://localhost:8000/api/process';

const CATEGORIES = [
  { id: 'color_models', label: 'Color Space Representation' },
  { id: 'fourier_analysis', label: 'Fourier Analysis' },
  { id: 'noise_reduction', label: 'Noise Reduction Methods' },
  { id: 'edge_detection', label: 'Edge Detection (Canny/LoG/DoG)' },
  { id: 'corner_detection', label: 'Harris Corner Detection' },
  { id: 'feature_descriptors', label: 'Feature Descriptors (ORB)' }
];

const DEFAULT_PARAMS = {
  // Fourier
  maskRadius: 30,
  // Noise
  noiseType: 'gaussian',
  noiseVariance: 0.05,
  filterType: 'gaussian',
  kernelSize: 5,
  // Edge Detection
  cannyMin: 50,
  cannyMax: 150,
  // Corner
  blockSize: 2,
  kSize: 3,
  kParam: 0.04,
  thresholdRatio: 0.01,
  // Descriptors
  nFeatures: 500
};

function App() {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState(CATEGORIES[3].id);
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);

  const handleFileUpload = (selectedFile) => {
    setFile(selectedFile);
  };

  const handleParamChange = (name, value) => {
    setParams(prev => ({ ...prev, [name]: isNaN(parseFloat(value)) ? value : parseFloat(value) }));
  };
  
  const handleStringParamChange = (name, value) => {
    setParams(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!file) return;

    const processImage = async () => {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('params', JSON.stringify(params));

      try {
        const response = await axios.post(API_URL, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setResults(response.data);
      } catch (error) {
        console.error('Error processing image:', error);
      } finally {
        setLoading(false);
      }
    };

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      processImage();
    }, 400);

    return () => clearTimeout(debounceTimer.current);
  }, [file, category, params]);

  return (
    <div className="app-container">
      <nav className="top-navbar">
        <div className="nav-title">
          <span className="gradient-text">NeuralVision Engine</span>
        </div>
        <div style={{color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <BookOpen size={16} /> Interactive Computer Vision Syllabus Editor
        </div>
      </nav>

      <div className="content-wrapper">
        <aside className="settings-panel">
          <div>
            <ImageUploader onUpload={handleFileUpload} currentFile={file} />
          </div>

          <div style={{opacity: file ? 1 : 0.5, pointerEvents: file ? 'auto' : 'none'}}>
            <div style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem'}}>Syllabus Topic Module</label>
              <select 
                className="custom-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 700}}>
              <Settings size={20} className="gradient-text" /> 
              Algorithm Parameters
            </div>
            <Controls 
              category={category}
              params={params} 
              onChange={handleParamChange}
              onStringChange={handleStringParamChange}
            />
          </div>
        </aside>

        <main className="main-display">
          {!results ? (
            <div className="empty-view">
              <div className="empty-view-icon">
                <ImageIcon size={40} />
              </div>
              <h2>Computer Vision Pipeline Ready</h2>
              <p>Upload a source image in the sidebar to visualize algorithm steps directly applied to your photo.</p>
            </div>
          ) : (
            <>
              <div>
                <h3 style={{fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <ImageIcon size={24} className="gradient-text"/> Visualization Board
                </h3>
                <PipelineVisualizer images={results.images} loading={loading} />
              </div>

              {Object.keys(results.metrics || {}).length > 0 && (
                <div style={{marginTop: '1rem'}}>
                  <MetricsDisplay metrics={results.metrics} />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
