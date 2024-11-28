import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, User, MessageSquare, Euro, Home as HomeIcon, Search, Minus, Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Home = () => {
  const { user } = useAuthStore();
  const [hasLicenseAndCar, setHasLicenseAndCar] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening'>('morning');
  const [detourMinutes, setDetourMinutes] = useState(10);

  const handleDetourChange = (amount: number) => {
    const newValue = detourMinutes + amount;
    if (newValue >= 5 && newValue <= 30) {
      setDetourMinutes(newValue);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4">
      {/* License and Car Toggle */}
      <div className="mb-8">
        <label className="flex items-center space-x-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={hasLicenseAndCar}
              onChange={(e) => setHasLicenseAndCar(e.target.checked)}
            />
            <div className={`w-14 h-7 rounded-full transition-colors ${
              hasLicenseAndCar ? 'bg-indigo-600' : 'bg-gray-200'
            }`}>
              <div className={`absolute w-5 h-5 rounded-full bg-white transform transition-transform top-1 ${
                hasLicenseAndCar ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </div>
          </div>
          <span className="text-lg font-medium">J'ai le permis et un véhicule</span>
        </label>
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

      {/* Driver Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Je suis conducteur</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minutes max. de détour
          </label>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleDetourChange(-5)}
              className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-200"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-2xl font-bold w-12 text-center">{detourMinutes}</span>
            <button
              onClick={() => handleDetourChange(5)}
              className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-200"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-xl p-6 mb-4">
          <div className="text-lg font-medium mb-2">[Nom du conducteur]</div>
          <div className="text-gray-600">{detourMinutes} minutes de détour</div>
          <div className="text-gray-600">Trajet non défini</div>
        </div>
      </div>

      {/* Passenger Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Je suis passager</h2>
        <div className="bg-indigo-50 rounded-xl p-6">
          <div className="text-lg font-medium mb-2">[Nom du passager]</div>
          <div className="text-gray-600">
            {timeOfDay === 'morning' ? "arrivée au travail à" : "départ du travail à"} [heure]
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-lg mx-auto flex justify-between px-4 py-3">
          <Link to="/" className="flex flex-col items-center text-indigo-600">
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs">Accueil</span>
          </Link>
          <Link to="/search" className="flex flex-col items-center text-gray-500">
            <Search className="h-6 w-6" />
            <span className="text-xs">Rechercher</span>
          </Link>
          <Link to="/messages" className="flex flex-col items-center text-gray-500">
            <MessageSquare className="h-6 w-6" />
            <span className="text-xs">Messages</span>
          </Link>
          <Link to="/pricing" className="flex flex-col items-center text-gray-500">
            <Euro className="h-6 w-6" />
            <span className="text-xs">Forfait</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center text-gray-500">
            <User className="h-6 w-6" />
            <span className="text-xs">Profil</span>
          </Link>
        </div>
      </div>

      {/* Add padding to account for fixed navigation */}
      <div className="h-20" />
    </div>
  );
};