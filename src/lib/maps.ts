import { LoadScriptProps } from '@react-google-maps/api';

export const GOOGLE_MAPS_API_KEY = 'AIzaSyBcn5L1CUmnpQjZ80aALKdve4P9YnvHLlM';

export const loadScriptOptions: LoadScriptProps = {
  googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  libraries: ['places', 'geometry'],
};

export const validateCoords = (coords: google.maps.LatLngLiteral | null | undefined): boolean => {
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

export const formatCoords = (coords: google.maps.LatLngLiteral): string => {
  if (!validateCoords(coords)) {
    throw new Error('Invalid coordinates');
  }
  return `${coords.lat},${coords.lng}`;
};

export const calculateRoute = async (
  origin: string,
  destination: string,
  waypoint1?: string,
  waypoint2?: string
): Promise<{
  distance: string;
  duration: string;
  route: google.maps.LatLngLiteral[];
}> => {
  if (!origin || !destination) {
    throw new Error('Origin and destination are required');
  }

  try {
    const directionsService = new google.maps.DirectionsService();

    const waypoints = [];
    if (waypoint1) {
      waypoints.push({
        location: waypoint1,
        stopover: true
      });
    }
    if (waypoint2) {
      waypoints.push({
        location: waypoint2,
        stopover: true
      });
    }

    const request: google.maps.DirectionsRequest = {
      origin,
      destination,
      waypoints,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    const result = await directionsService.route(request);

    if (result.status === 'OK' && result.routes[0]) {
      const route = result.routes[0];

      // Calculate total distance and duration for all legs
      const totalDistance = route.legs.reduce((acc, leg) => acc + (leg.distance?.value || 0), 0);
      const totalDuration = route.legs.reduce((acc, leg) => acc + (leg.duration?.value || 0), 0);

      const path = route.overview_path.map(point => ({
        lat: point.lat(),
        lng: point.lng(),
      }));

      return {
        distance: `${Math.round(totalDistance / 1000)} km`,
        duration: Math.round(totalDuration / 60).toString(),
        route: path,
      };
    }

    throw new Error('Route calculation failed');
  } catch (error) {
    console.error('Error calculating route:', error);
    throw error;
  }
};