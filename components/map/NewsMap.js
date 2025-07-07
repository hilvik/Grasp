'use client';

import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, LayerGroup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { format } from 'date-fns';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, MapPin, Layers, Home, ZoomIn, ZoomOut, Maximize2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import MapControls from './MapControls';
import MapLegend from './MapLegend';
import { getCountryCoordinates } from '@/utils/mapHelpers';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom sentiment icons
const createSentimentIcon = (sentiment) => {
  const colors = {
    positive: '#10B981',
    negative: '#EF4444',
    neutral: '#6B7280'
  };

  return L.divIcon({
    html: `
      <div style="
        background-color: ${colors[sentiment] || colors.neutral};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
    `,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Map event handlers component
function MapEvents({ onMoveEnd }) {
  const map = useMap();
  
  useEffect(() => {
    map.on('moveend', onMoveEnd);
    return () => {
      map.off('moveend', onMoveEnd);
    };
  }, [map, onMoveEnd]);
  
  return null;
}

export default function NewsMap({ articles = [] }) {
  const [mapCenter, setMapCenter] = useState([20, 0]); // World center
  const [mapZoom, setMapZoom] = useState(2);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleArticles, setVisibleArticles] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef();

  // Process articles to add coordinates
  const articlesWithCoords = articles.map(article => {
    // If article has coordinates, use them
    if (article.latitude && article.longitude) {
      return article;
    }
    
    // Otherwise, try to get coordinates from country code
    if (article.country_code) {
      const coords = getCountryCoordinates(article.country_code);
      if (coords) {
        return {
          ...article,
          latitude: coords.lat + (Math.random() - 0.5) * 2, // Add some randomness to prevent overlap
          longitude: coords.lng + (Math.random() - 0.5) * 2
        };
      }
    }
    
    // Default to random location if no location info
    return {
      ...article,
      latitude: (Math.random() - 0.5) * 160, // -80 to 80
      longitude: (Math.random() - 0.5) * 360  // -180 to 180
    };
  }).filter(article => article.latitude && article.longitude);

  // Filter articles by category
  const filteredArticles = selectedCategory === 'all' 
    ? articlesWithCoords 
    : articlesWithCoords.filter(article => article.category === selectedCategory);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  // Get sentiment for article
  const getSentiment = (score) => {
    if (!score && score !== 0) return 'neutral';
    if (score > 0.2) return 'positive';
    if (score < -0.2) return 'negative';
    return 'neutral';
  };

  // Create popup content
  const createPopupContent = (article) => {
    const sentiment = getSentiment(article.sentiment_score);
    
    return (
      <div className="news-popup">
        {article.image_url && (
          <img 
            src={article.image_url} 
            alt={article.title}
            className="news-popup-image"
            onError={(e) => e.target.style.display = 'none'}
          />
        )}
        <div className="news-popup-content">
          <h3 className="news-popup-title">{article.title}</h3>
          <div className="news-popup-meta">
            <div>{article.source_name}</div>
            <div>{format(new Date(article.published_at), 'MMM dd, yyyy')}</div>
          </div>
          {article.summary && (
            <p className="news-popup-summary">{article.summary}</p>
          )}
          <div className="flex gap-2 mb-3">
            {article.category && (
              <Badge variant="secondary" className="text-xs capitalize">
                {article.category}
              </Badge>
            )}
            <Badge 
              variant="outline" 
              className={`text-xs ${
                sentiment === 'positive' ? 'text-green-600' : 
                sentiment === 'negative' ? 'text-red-600' : 
                'text-gray-600'
              }`}
            >
              {sentiment === 'positive' ? <TrendingUp className="w-3 h-3 mr-1" /> :
               sentiment === 'negative' ? <TrendingDown className="w-3 h-3 mr-1" /> :
               <Minus className="w-3 h-3 mr-1" />}
              {sentiment}
            </Badge>
          </div>
          <Link href={`/news/${article.id}`} className="news-popup-link">
            Read Full Article
          </Link>
        </div>
      </div>
    );
  };

  // Handle map movement
  const handleMoveEnd = () => {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds();
      const visible = filteredArticles.filter(article => {
        return bounds.contains([article.latitude, article.longitude]);
      });
      setVisibleArticles(visible);
    }
  };

  // Fly to location
  const flyToLocation = (lat, lng, zoom = 10) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], zoom, {
        duration: 2
      });
    }
  };

  // Get categories from articles
  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))];

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full"
        ref={mapRef}
        worldCopyJump={true}
        minZoom={2}
        maxZoom={18}
      >
        <MapEvents onMoveEnd={handleMoveEnd} />
        
        <LayersControl position="topright">
          {/* Base layers */}
          <LayersControl.BaseLayer checked name="Light">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Dark">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          {/* Overlay layers */}
          <LayersControl.Overlay checked name="News Articles">
            <MarkerClusterGroup
              chunkedLoading
              maxClusterRadius={60}
              spiderfyOnMaxZoom={true}
              showCoverageOnHover={false}
            >
              {filteredArticles.map((article) => {
                const sentiment = getSentiment(article.sentiment_score);
                
                return (
                  <Marker
                    key={article.id}
                    position={[article.latitude, article.longitude]}
                    icon={createSentimentIcon(sentiment)}
                  >
                    <Popup className="news-popup" maxWidth={320}>
                      {createPopupContent(article)}
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          </LayersControl.Overlay>

          {/* User location */}
          {userLocation && (
            <LayersControl.Overlay name="My Location">
              <LayerGroup>
                <Marker 
                  position={userLocation}
                  icon={L.divIcon({
                    html: `
                      <div style="
                        background-color: #3B82F6;
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                        animation: pulse 2s infinite;
                      "></div>
                    `,
                    className: 'user-location-marker',
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                  })}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>Your Location</strong>
                    </div>
                  </Popup>
                </Marker>
              </LayerGroup>
            </LayersControl.Overlay>
          )}
        </LayersControl>

        {/* Custom controls */}
        <MapControls 
          onGoHome={() => flyToLocation(20, 0, 2)}
          onGoToUser={() => userLocation && flyToLocation(userLocation[0], userLocation[1], 10)}
          hasUserLocation={!!userLocation}
        />

        {/* Legend */}
        <MapLegend />
      </MapContainer>

      {/* Category filter */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 pr-8 text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Article count */}
      <div className="absolute top-4 right-[70px] z-[1000] bg-white rounded-lg shadow-lg px-3 py-2">
        <div className="text-sm font-medium">
          {visibleArticles.length} of {filteredArticles.length} articles in view
        </div>
      </div>

      {/* Add custom styles */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
      `}</style>
    </div>
  );
}