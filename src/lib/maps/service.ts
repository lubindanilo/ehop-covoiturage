import { initGoogleMaps } from './config';
import { calculateRoute } from './routing';
import { validateCoords, formatCoords } from './geocoding';
import { LatLngLiteral } from '@react-google-maps/api';

class MapsService {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    await initGoogleMaps();
    this.initialized = true;
  }

  async calculateMatchRoute(
    origin: LatLngLiteral,
    destination: LatLngLiteral,
    pickupPoint?: LatLngLiteral,
    dropoffPoint?: LatLngLiteral
  ) {
    try {
      await this.init();

      if (!validateCoords(origin) || !validateCoords(destination)) {
        throw new Error('Invalid coordinates provided');
      }

      const originStr = formatCoords(origin);
      const destinationStr = formatCoords(destination);
      const pickupStr = pickupPoint ? formatCoords(pickupPoint) : undefined;
      const dropoffStr = dropoffPoint ? formatCoords(dropoffPoint) : undefined;

      return await calculateRoute(originStr, destinationStr, pickupStr, dropoffStr);
    } catch (error) {
      console.error('Error in calculateMatchRoute:', error);
      throw new Error('Failed to calculate route');
    }
  }

  async calculateDirectRoute(
    origin: LatLngLiteral,
    destination: LatLngLiteral
  ) {
    try {
      await this.init();

      if (!validateCoords(origin) || !validateCoords(destination)) {
        throw new Error('Invalid coordinates provided');
      }

      return await calculateRoute(
        formatCoords(origin),
        formatCoords(destination)
      );
    } catch (error) {
      console.error('Error in calculateDirectRoute:', error);
      throw new Error('Failed to calculate direct route');
    }
  }
}

export const mapsService = new MapsService();