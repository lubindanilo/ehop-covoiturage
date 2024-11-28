import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Car, Upload } from 'lucide-react';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { BankTransferSetup } from '../components/BankTransferSetup';

interface WorkSchedule {
  monday: { enabled: boolean; arrivalTime: string; departureTime: string };
  tuesday: { enabled: boolean; arrivalTime: string; departureTime: string };
  wednesday: { enabled: boolean; arrivalTime: string; departureTime: string };
  thursday: { enabled: boolean; arrivalTime: string; departureTime: string };
  friday: { enabled: boolean; arrivalTime: string; departureTime: string };
  saturday: { enabled: boolean; arrivalTime: string; departureTime: string };
}

const defaultSchedule: WorkSchedule = {
  monday: { enabled: true, arrivalTime: '', departureTime: '' },
  tuesday: { enabled: true, arrivalTime: '', departureTime: '' },
  wednesday: { enabled: true, arrivalTime: '', departureTime: '' },
  thursday: { enabled: true, arrivalTime: '', departureTime: '' },
  friday: { enabled: true, arrivalTime: '', departureTime: '' },
  saturday: { enabled: false, arrivalTime: '', departureTime: '' },
};

export const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [job, setJob] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [workAddress, setWorkAddress] = useState('');
  const [homeCoords, setHomeCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [workCoords, setWorkCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [schedule, setSchedule] = useState<WorkSchedule>(defaultSchedule);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showBankTransfer, setShowBankTransfer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuthStore();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La taille de l\'image ne doit pas dépasser 5MB');
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScheduleChange = (
    day: keyof WorkSchedule,
    field: 'enabled' | 'arrivalTime' | 'departureTime',
    value: boolean | string
  ) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const copyScheduleToAllDays = () => {
    const sourceDay = schedule.monday;
    const updatedSchedule = Object.keys(schedule).reduce((acc, day) => ({
      ...acc,
      [day]: {
        ...schedule[day as keyof WorkSchedule],
        arrivalTime: sourceDay.arrivalTime,
        departureTime: sourceDay.departureTime,
      },
    }), {} as WorkSchedule);

    setSchedule(updatedSchedule);
  };

  const handleBankTransferComplete = async (bankData: any) => {
    try {
      if (!validateForm()) return;

      await signUp(email, password, {
        firstName,
        lastName,
        birthday,
        job,
        homeAddress,
        workAddress,
        homeCoords,
        workCoords,
        schedule,
        bankInfo: bankData,
        profileImage,
        createdAt: new Date().toISOString(),
      });

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error signing up:', err);
      setError(getErrorMessage(err.code));
    }
  };

  const validateForm = () => {
    if (isSignUp) {
      if (!firstName || !lastName || !birthday || !job || !homeAddress || !workAddress) {
        setError('Veuillez remplir tous les champs obligatoires');
        return false;
      }

      if (!homeCoords || !workCoords) {
        setError('Veuillez sélectionner des adresses valides dans les suggestions');
        return false;
      }

      const today = new Date();
      const birthDate = new Date(birthday);
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        setError('Vous devez avoir au moins 18 ans pour vous inscrire');
        return false;
      }
    }

    if (!email || !password) {
      setError('Veuillez remplir tous les champs obligatoires');
      return false;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      if (isSignUp) {
        setShowBankTransfer(true);
      } else {
        await signIn(email, password);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(getErrorMessage(err.code));
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-credential':
        return 'Email ou mot de passe incorrect';
      case 'auth/user-not-found':
        return 'Aucun compte trouvé avec cet email';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/email-already-in-use':
        return 'Un compte existe déjà avec cet email';
      case 'auth/weak-password':
        return 'Le mot de passe est trop faible';
      case 'auth/invalid-email':
        return 'Format d\'email invalide';
      default:
        return 'Une erreur est survenue. Veuillez réessayer.';
    }
  };

  if (showBankTransfer) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <BankTransferSetup onComplete={handleBankTransferComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="flex justify-center mb-8">
          <Car className="h-12 w-12 text-indigo-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-8">
          {isSignUp ? 'Créer un compte' : 'Bienvenue'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <>
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center">
                <div 
                  className="w-24 h-24 rounded-full bg-gray-200 mb-2 relative cursor-pointer overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Changer la photo
                </button>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profession
                </label>
                <input
                  type="text"
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse domicile
                </label>
                <AddressAutocomplete
                  value={homeAddress}
                  onChange={(value, coords) => {
                    setHomeAddress(value);
                    setHomeCoords(coords || null);
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse travail
                </label>
                <AddressAutocomplete
                  value={workAddress}
                  onChange={(value, coords) => {
                    setWorkAddress(value);
                    setWorkCoords(coords || null);
                  }}
                  required
                />
              </div>

              {/* Work Schedule */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Horaires de travail</h3>
                  <button
                    type="button"
                    onClick={copyScheduleToAllDays}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Copier à tous les jours
                  </button>
                </div>

                <div className="space-y-4">
                  {Object.entries(schedule).map(([day, value]) => (
                    <div key={day} className="flex items-center space-x-4">
                      <label className="inline-flex items-center min-w-[100px]">
                        <input
                          type="checkbox"
                          checked={value.enabled}
                          onChange={(e) => handleScheduleChange(day as keyof WorkSchedule, 'enabled', e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2">
                          {day === 'monday' ? 'Lundi' :
                           day === 'tuesday' ? 'Mardi' :
                           day === 'wednesday' ? 'Mercredi' :
                           day === 'thursday' ? 'Jeudi' :
                           day === 'friday' ? 'Vendredi' :
                           'Samedi'}
                        </span>
                      </label>
                      
                      {value.enabled && (
                        <>
                          <input
                            type="time"
                            value={value.arrivalTime}
                            onChange={(e) => handleScheduleChange(day as keyof WorkSchedule, 'arrivalTime', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            required
                          />
                          <input
                            type="time"
                            value={value.departureTime}
                            onChange={(e) => handleScheduleChange(day as keyof WorkSchedule, 'departureTime', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            required
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {isSignUp ? 'S\'inscrire' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-indigo-600 hover:text-indigo-700"
          >
            {isSignUp
              ? 'Déjà un compte ? Connectez-vous'
              : 'Pas de compte ? Inscrivez-vous'}
          </button>
        </div>
      </div>
    </div>
  );
};