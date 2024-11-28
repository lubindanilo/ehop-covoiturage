import { useState, useEffect, useRef } from 'react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { MapPin } from 'lucide-react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string, coords?: google.maps.LatLngLiteral) => void;
  disabled?: boolean;
  required?: boolean;
}

export const AddressAutocomplete = ({
  value,
  onChange,
  disabled = false,
  required = false,
}: AddressAutocompleteProps) => {
  const {
    ready,
    suggestions: { data },
    setValue: setSearchValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'fr' },
      types: ['address'],
    },
    debounce: 300,
    cache: 86400,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      setSearchValue(value, false);
      validateAddress(value);
    }
  }, [value, setSearchValue]);

  const validateAddress = async (address: string) => {
    try {
      const results = await getGeocode({ address });
      const coords = await getLatLng(results[0]);
      setIsValidAddress(true);
      onChange(address, coords);
    } catch (error) {
      setIsValidAddress(false);
      onChange(address);
    }
  };

  const handleSelect = async (address: string) => {
    setSearchValue(address, false);
    clearSuggestions();
    setIsOpen(false);

    try {
      const results = await getGeocode({ address });
      const coords = await getLatLng(results[0]);
      setIsValidAddress(true);
      onChange(address, coords);
    } catch (error) {
      console.error('Error getting geocode:', error);
      setIsValidAddress(false);
      onChange(address);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setSearchValue(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
            setIsValidAddress(false);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={!ready || disabled}
          required={required}
          className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-100"
          placeholder="Saisissez une adresse"
        />
        {value && !isValidAddress && !disabled && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <span className="text-yellow-600 text-sm">⚠️ Sélectionnez une adresse complète</span>
          </div>
        )}
      </div>

      {isOpen && data.length > 0 && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
          <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {data.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => handleSelect(suggestion.description)}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50"
              >
                {suggestion.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};