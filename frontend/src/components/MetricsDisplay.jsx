import React from 'react';

const HistogramChart = ({ data, color, maxVal }) => {
  if (!data || data.length === 0) return null;
  
  return (
    <div className="histogram-container">
      {data.map((val, i) => {
        if (i % 2 !== 0) return null;
        let height = maxVal > 0 ? (val / maxVal) * 100 : 0;
        return (
          <div 
            key={i} 
            className={`hist-bar ${color === 'purple' ? 'enhanced' : ''}`}
            style={{ height: `${height}%` }}
            title={`Intensity ${i}: ${val}`}
          />
        );
      })}
    </div>
  );
};

export default function MetricsDisplay({ metrics }) {
  if (!metrics) return null;

  const origMax = metrics.histogram?.original ? Math.max(...metrics.histogram.original) : 1;
  const enhMax = metrics.histogram?.enhanced ? Math.max(...metrics.histogram.enhanced) : 1;
  const globalMax = Math.max(origMax, enhMax);

  return (
    <div>
      <div className="metrics-row">
        <div className="metric-box">
          <div className="metric-val">{(metrics.edgeDensity * 100).toFixed(2)}%</div>
          <div className="metric-name">Edge Density Factor</div>
        </div>
        
        <div className="metric-box">
          <div className="metric-val">{metrics.sharpness.toFixed(0)}</div>
          <div className="metric-name">Laplacian Variance</div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <h4 style={{fontSize: '1.1rem'}}>Original Source Distribution</h4>
            <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Pre-processed pixel intensity</div>
          </div>
        </div>
        <HistogramChart data={metrics.histogram?.original} color="blue" maxVal={globalMax} />
      </div>

      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <h4 style={{fontSize: '1.1rem'}}>Equalized Distribution</h4>
            <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Flattened contrast landscape</div>
          </div>
        </div>
        <HistogramChart data={metrics.histogram?.enhanced} color="purple" maxVal={globalMax} />
      </div>
    </div>
  );
}
