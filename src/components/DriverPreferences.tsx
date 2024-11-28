import React from 'react';
import { Volume2, Radio, Music, VolumeX } from 'lucide-react';
import { DriverPreferences as DriverPrefsType } from '../types/user';

interface DriverPreferencesProps {
  preferences: DriverPrefsType;
  onChange: (preferences: DriverPrefsType) => void;
  disabled?: boolean;
}

export const DriverPreferences: React.FC<DriverPreferencesProps> = ({
  preferences,
  onChange,
  disabled = false
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Style de communication
        </h3>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => onChange({ ...preferences, communicationStyle: 'quiet' })}
            disabled={disabled}
            className={`flex-1 p-3 rounded-lg border ${
              preferences.communicationStyle === 'quiet'
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200'
            }`}
          >
            <Volume2 className="w-5 h-5 mx-auto mb-2" />
            <span className="block text-sm">Calme</span>
          </button>
          
          <button
            type="button"
            onClick={() => onChange({ ...preferences, communicationStyle: 'talkative' })}
            disabled={disabled}
            className={`flex-1 p-3 rounded-lg border ${
              preferences.communicationStyle === 'talkative'
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200'
            }`}
          >
            <Volume2 className="w-5 h-5 mx-auto mb-2" />
            <span className="block text-sm">Bavard</span>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Divertissement
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => onChange({ ...preferences, entertainment: 'radio' })}
            disabled={disabled}
            className={`p-3 rounded-lg border ${
              preferences.entertainment === 'radio'
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200'
            }`}
          >
            <Radio className="w-5 h-5 mx-auto mb-2" />
            <span className="block text-sm">Radio</span>
          </button>
          
          <button
            type="button"
            onClick={() => onChange({ ...preferences, entertainment: 'music' })}
            disabled={disabled}
            className={`p-3 rounded-lg border ${
              preferences.entertainment === 'music'
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200'
            }`}
          >
            <Music className="w-5 h-5 mx-auto mb-2" />
            <span className="block text-sm">Musique</span>
          </button>
          
          <button
            type="button"
            onClick={() => onChange({ ...preferences, entertainment: 'none' })}
            disabled={disabled}
            className={`p-3 rounded-lg border ${
              preferences.entertainment === 'none'
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200'
            }`}
          >
            <VolumeX className="w-5 h-5 mx-auto mb-2" />
            <span className="block text-sm">Aucun</span>
          </button>
        </div>
      </div>
    </div>
  );
};