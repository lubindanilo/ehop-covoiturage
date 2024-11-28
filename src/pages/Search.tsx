import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, User, Clock, MapPin } from 'lucide-react';
import { AddressAutocomplete } from '../components/AddressAutocomplete';

export const Search = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'driver' | 'passenger'>('passenger');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening'>('morning');

  const handleSearch = () => {
    navigate('/dashboard', { 
      state: { role, timeOfDay }
    });
  };

  return (
    <div className="max-w-lg mx-auto px-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Rechercher un trajet</h1>

      {/* Role Selection */}
      <div className="mb-8">
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          <button
            className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 ${
              role === 'driver'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setRole('driver')}
          >
            <Car className="w-5 h-5" />
            <span>Conducteur</span>
          </button>
          <button
            className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 ${
              role === 'passenger'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setRole('passenger')}
          >
            <User className="w-5 h-5" />
            <span>Passager</span>
          </button>
        </div>
      </div>

      {/* Time of Day Selection */}
      <div className="flex mb-8 border-b">
        <button
          className={`flex-1 text-xl font-medium py-2 border-b-2 transition-colors ${
            timeOfDay === 'morning'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setTimeOfDay('morning')}
        >
          Matin
        </button>
        <button
          className={`flex-1 text-xl font-medium py-2 border-b-2 transition-colors ${
            timeOfDay === 'evening'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setTimeOfDay('evening')}
        >
          Soir
        </button>
      </div>

      <button
        onClick={handleSearch}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Rechercher
      </button>
    </div>
  );
};