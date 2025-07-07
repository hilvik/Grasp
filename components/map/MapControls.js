'use client';

import { Button } from '@/components/ui/button';
import { Home, MapPin, ZoomIn, ZoomOut, Maximize2, Layers } from 'lucide-react';
import { useMap } from 'react-leaflet';

export default function MapControls({ onGoHome, onGoToUser, hasUserLocation }) {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleFullscreen = () => {
    const mapContainer = map.getContainer();
    if (mapContainer.requestFullscreen) {
      mapContainer.requestFullscreen();
    } else if (mapContainer.mozRequestFullScreen) {
      mapContainer.mozRequestFullScreen();
    } else if (mapContainer.webkitRequestFullscreen) {
      mapContainer.webkitRequestFullscreen();
    } else if (mapContainer.msRequestFullscreen) {
      mapContainer.msRequestFullscreen();
    }
  };

  return (
    <div className="map-controls">
      <Button
        size="icon"
        variant="ghost"
        className="map-control-button"
        onClick={handleZoomIn}
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <Button
        size="icon"
        variant="ghost"
        className="map-control-button"
        onClick={handleZoomOut}
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button
        size="icon"
        variant="ghost"
        className="map-control-button"
        onClick={onGoHome}
        title="World View"
      >
        <Home className="h-4 w-4" />
      </Button>
      
      {hasUserLocation && (
        <Button
          size="icon"
          variant="ghost"
          className="map-control-button"
          onClick={onGoToUser}
          title="Go to My Location"
        >
          <MapPin className="h-4 w-4" />
        </Button>
      )}
      
      <Button
        size="icon"
        variant="ghost"
        className="map-control-button"
        onClick={handleFullscreen}
        title="Fullscreen"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
}