import { LatLngLiteral } from '@react-google-maps/api';

export const calculateRoute = async (
  origin: string,
  destination: string,
  waypoint1?: string,
  waypoint2?: string
): Promise<{
  distance: string;
  duration: string;
  route: LatLngLiteral[];
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