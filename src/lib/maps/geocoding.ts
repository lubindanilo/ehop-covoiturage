import { LatLngLiteral } from '@react-google-maps/api';

export const validateCoords = (coords: LatLngLiteral | null | undefined): boolean => {
  return !!(coords && 
    typeof coords === 'object' &&
    'lat' in coords &&
    'lng' in coords &&
    typeof coords.lat === 'number' &&
    typeof coords.lng === 'number' &&
    !isNaN(coords.lat) &&
    !isNaN(coords.lng) &&
    coords.lat >= -90 &&
    coords.lat <= 90 &&
    coords.lng >= -180 &&
    coords.lng <= 180
  );
};

export const formatCoords = (coords: LatLngLiteral): string => {
  if (!validateCoords(coords)) {
    throw new Error('Invalid coordinates');
  }
  return `${coords.lat},${coords.lng}`;
};