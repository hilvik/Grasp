'use client';

export default function MapLegend() {
  return (
    <div className="map-legend">
      <h4>Sentiment</h4>
      <div className="legend-item">
        <div className="legend-color" style={{ backgroundColor: '#10B981' }}></div>
        <span>Positive</span>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{ backgroundColor: '#6B7280' }}></div>
        <span>Neutral</span>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{ backgroundColor: '#EF4444' }}></div>
        <span>Negative</span>
      </div>
    </div>
  );
}