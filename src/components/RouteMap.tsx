import { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Polyline, Marker } from '@react-google-maps/api';
import { loadScriptOptions } from '../lib/maps';

interface RouteMapProps {
  origin: google.maps.LatLngLiteral | null;
  destination: google.maps.LatLngLiteral | null;
  path?: google.maps.LatLngLiteral[];
}

const defaultCenter = { lat: 46.603354, lng: 1.888334 }; // Center of France

export const RouteMap = ({ origin, destination, path }: RouteMapProps) => {
  const [bounds, setBounds] = useState<google.maps.LatLngBounds>();
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (origin && destination) {
      try {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(origin);
        bounds.extend(destination);
        setBounds(bounds);
        setMapError(null);
      } catch (error) {
        console.error('Error setting map bounds:', error);
        setMapError('Erreur de chargement de la carte');
      }
    }
  }, [origin, destination]);

  if (mapError) {
    return (
      <div className="w-full h-[400px] rounded-lg bg-gray-100 flex items-center justify-center">
        <p className="text-red-600">{mapError}</p>
      </div>
    );
  }

  return (
    <LoadScript {...loadScriptOptions}>
      <GoogleMap
        mapContainerClassName="w-full h-[400px] rounded-lg"
        center={defaultCenter}
        zoom={5}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
        }}
        onLoad={(map) => {
          if (bounds) {
            map.fitBounds(bounds);
          }
        }}
      >
        {origin && <Marker position={origin} />}
        {destination && <Marker position={destination} />}
        
        {path && path.length > 0 && (
          <Polyline
            path={path}
            options={{
              strokeColor: '#10B981',
              strokeOpacity: 0.8,
              strokeWeight: 4,
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};