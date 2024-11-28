import { LoadScriptProps } from '@react-google-maps/api';

export const GOOGLE_MAPS_API_KEY = 'AIzaSyBcn5L1CUmnpQjZ80aALKdve4P9YnvHLlM';

export const loadScriptOptions: LoadScriptProps = {
  googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  libraries: ['places', 'geometry'],
};

let isGoogleMapsLoaded = false;

export const initGoogleMaps = (): Promise<void> => {
  if (isGoogleMapsLoaded) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      isGoogleMapsLoaded = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};