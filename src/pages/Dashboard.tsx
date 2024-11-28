import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot,
  orderBy,
  startAfter,
  limit,
  doc,
  getDoc
} from 'firebase/firestore';
import { Car, User, Clock, MapPin, AlertCircle, Calendar, Minus, Plus, MessageCircle } from 'lucide-react';
import { calculateRoute } from '../lib/maps';
import { RouteMap } from '../components/RouteMap';
import { Chat } from '../components/Chat';
import { ProfilePicture } from '../components/ProfilePicture';
import { calculateMatchDetails } from '../lib/matching';

interface WorkDay {
  enabled: boolean;
  arrivalTime: string;
  departureTime: string;
}

interface WorkSchedule {
  monday: WorkDay;
  tuesday: WorkDay;
  wednesday: WorkDay;
  thursday: WorkDay;
  friday: WorkDay;
  saturday: WorkDay;
}

interface UserProfile {
  name: string;
  homeAddress: string;
  workAddress: string;
  homeCoords: google.maps.LatLngLiteral;
  workCoords: google.maps.LatLngLiteral;
  schedule: WorkSchedule;
  hasLicense: boolean;
  hasCar: boolean;
  maxDetourMinutes?: number;
  photoURL?: string;
}

interface Match {
  user: UserProfile;
  distance: string;
  duration: string;
  detourTime: number;
  matchScore: number;
  adjustedArrivalTime?: string;
  adjustedDepartureTime?: string;
}

const weekDays = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
};

const getCurrentDay = () => {
  const day = new Date().getDay();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[day] === 'sunday' ? 'monday' : days[day];
};

export const Dashboard = () => {
  const { user } = useAuthStore();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [section, setSection] = useState<'morning' | 'evening'>('morning');
  const [selectedDay, setSelectedDay] = useState(getCurrentDay());
  const [driverMatches, setDriverMatches] = useState<Match[]>([]);
  const [passengerMatches, setPassengerMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [maxDetourMinutes, setMaxDetourMinutes] = useState(10);
  const [showChat, setShowChat] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    if (userProfile) {
      const unsubscribe = setupMatchesListener();
      return () => unsubscribe();
    }
  }, [userProfile, section, selectedDay, maxDetourMinutes]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        if (!data.schedule) {
          setError('Profil incomplet');
          return;
        }
        setUserProfile(data);
        setError(null);
      } else {
        setError('Profil non trouvé');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const setupMatchesListener = () => {
    if (!userProfile) return () => {};

    const usersRef = collection(db, 'users');
    return onSnapshot(
      query(usersRef, where('schedule.' + selectedDay + '.enabled', '==', true)),
      async (snapshot) => {
        try {
          setLoading(true);
          const driverResults: Match[] = [];
          const passengerResults: Match[] = [];

          for (const doc of snapshot.docs) {
            if (doc.id === user?.uid) continue;

            const potentialMatch = doc.data() as UserProfile;
            if (!potentialMatch.schedule?.[selectedDay as keyof WorkSchedule]?.enabled) continue;

            try {
              const matchDetails = await calculateMatchDetails(
                userProfile,
                potentialMatch,
                selectedDay as keyof WorkSchedule,
                section
              );

              if (matchDetails.detourMinutes <= maxDetourMinutes) {
                const matchScore = calculateMatchScore(userProfile, potentialMatch);
                
                driverResults.push({
                  user: potentialMatch,
                  detourTime: matchDetails.detourMinutes,
                  distance: '0 km',
                  duration: '0 min',
                  matchScore,
                  adjustedArrivalTime: section === 'morning' ? matchDetails.adjustedTime : undefined,
                  adjustedDepartureTime: section === 'evening' ? matchDetails.adjustedTime : undefined
                });
              }

              if (matchDetails.passengerDetourMinutes <= (potentialMatch.maxDetourMinutes || Infinity)) {
                const matchScore = calculateMatchScore(potentialMatch, userProfile);
                
                passengerResults.push({
                  user: potentialMatch,
                  detourTime: matchDetails.passengerDetourMinutes,
                  distance: '0 km',
                  duration: '0 min',
                  matchScore,
                  adjustedArrivalTime: section === 'morning' ? matchDetails.adjustedTime : undefined,
                  adjustedDepartureTime: section === 'evening' ? matchDetails.adjustedTime : undefined
                });
              }
            } catch (error) {
              console.error('Error calculating match details:', error);
              continue;
            }
          }

          setDriverMatches(driverResults.sort((a, b) => b.matchScore - a.matchScore));
          setPassengerMatches(passengerResults.sort((a, b) => b.matchScore - a.matchScore));
        } catch (error) {
          console.error('Error processing matches:', error);
          setError('Erreur lors de la recherche de correspondances');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const calculateMatchScore = (profile1: UserProfile, profile2: UserProfile): number => {
    // Calculate schedule compatibility
    const scheduleScore = Object.keys(profile1.schedule).reduce((score, day) => {
      const day1 = profile1.schedule[day as keyof WorkSchedule];
      const day2 = profile2.schedule[day as keyof WorkSchedule];
      if (day1.enabled && day2.enabled) {
        const arrivalDiff = Math.abs(getMinutes(day1.arrivalTime) - getMinutes(day2.arrivalTime));
        const departureDiff = Math.abs(getMinutes(day1.departureTime) - getMinutes(day2.departureTime));
        if (arrivalDiff <= 30 && departureDiff <= 30) score += 1;
      }
      return score;
    }, 0);

    // Calculate location proximity
    const homeDistance = getDistance(profile1.homeCoords, profile2.homeCoords);
    const workDistance = getDistance(profile1.workCoords, profile2.workCoords);
    const locationScore = Math.max(0, 100 - ((homeDistance + workDistance) / 2));

    // Combine scores (50% schedule, 50% location)
    return Math.round((scheduleScore * 50 + locationScore * 50) / 100);
  };

  const getMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  const getDistance = (
    point1: google.maps.LatLngLiteral,
    point2: google.maps.LatLngLiteral
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(point2.lat - point1.lat);
    const dLon = toRad(point2.lng - point1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(point1.lat)) *
        Math.cos(toRad(point2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return (value * Math.PI) / 180;
  };

  const handleDetourChange = (amount: number) => {
    const newValue = maxDetourMinutes + amount;
    if (newValue >= 1) {
      setMaxDetourMinutes(newValue);
    }
  };

  const handleMatchClick = async (match: Match) => {
    setSelectedMatch(match);
    try {
      const route = await calculateRoute(
        section === 'morning' ? 
          `${userProfile!.homeCoords.lat},${userProfile!.homeCoords.lng}` :
          `${userProfile!.workCoords.lat},${userProfile!.workCoords.lng}`,
        section === 'morning' ?
          `${match.user.homeCoords.lat},${match.user.homeCoords.lng}` :
          `${match.user.workCoords.lat},${match.user.workCoords.lng}`
      );
      setRoutePath(route.route);
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  const handleChatClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowChat(true);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-lg text-gray-600">{error}</p>
      </div>
    );
  }

  if (!userProfile?.schedule) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-lg text-gray-600">Veuillez compléter votre profil pour voir les correspondances</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4">
      {/* Time of Day Selection */}
      <div className="flex mb-8 border-b">
        <button
          className={`flex-1 text-xl font-medium py-2 border-b-2 transition-colors ${
            section === 'morning'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSection('morning')}
        >
          Matin
        </button>
        <button
          className={`flex-1 text-xl font-medium py-2 border-b-2 transition-colors ${
            section === 'evening'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSection('evening')}
        >
          Soir
        </button>
      </div>

      {/* Day Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="inline-block w-4 h-4 mr-2" />
          Jour de la semaine
        </label>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
        >
          {Object.entries(weekDays).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Driver Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">En tant que conducteur</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Détour maximum accepté
          </label>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleDetourChange(-1)}
              className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-200"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-2xl font-bold w-12 text-center">{maxDetourMinutes}</span>
            <button
              onClick={() => handleDetourChange(1)}
              className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-200"
            >
              <Plus className="w-5 h-5" />
            </button>
            <span className="text-gray-600">minutes</span>
          </div>
        </div>

        {driverMatches.length > 0 ? (
          <div className="space-y-4">
            {driverMatches.map((match, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedMatch?.user.name === match.user.name
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-200'
                }`}
                onClick={() => handleMatchClick(match)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <ProfilePicture
                      url={match.user.photoURL}
                      userId={match.user.name}
                      size="sm"
                    />
                    <div>
                      <div className="font-medium">{match.user.name}</div>
                      <div className="text-sm text-gray-500">
                        {match.matchScore}% compatible
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChatClick(match.user.name);
                    }}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Détour : {match.detourTime} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{match.user.homeAddress}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Aucun passager trouvé</p>
          </div>
        )}
      </div>

      {/* Passenger Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">En tant que passager</h2>
        
        {passengerMatches.length > 0 ? (
          <div className="space-y-4">
            {passengerMatches.map((match, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedMatch?.user.name === match.user.name
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-200'
                }`}
                onClick={() => handleMatchClick(match)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <ProfilePicture
                      url={match.user.photoURL}
                      userId={match.user.name}
                      size="sm"
                    />
                    <div>
                      <div className="font-medium">{match.user.name}</div>
                      <div className="text-sm text-gray-500">
                        {match.matchScore}% compatible
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChatClick(match.user.name);
                    }}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {section === 'morning' 
                        ? `Arrivée à ${match.adjustedArrivalTime}`
                        : `Départ à ${match.adjustedDepartureTime}`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{match.user.homeAddress}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Aucun conducteur trouvé</p>
          </div>
        )}
      </div>

      {/* Map Section */}
      {selectedMatch && (
        <div className="mt-6 h-[400px] rounded-lg overflow-hidden border border-gray-200">
          <RouteMap
            origin={section === 'morning' ? userProfile.homeCoords : userProfile.workCoords}
            destination={section === 'morning' ? selectedMatch.user.homeCoords : selectedMatch.user.workCoords}
            path={routePath}
          />
        </div>
      )}

      {/* Chat Modal */}
      {showChat && selectedUserId && (
        <Chat
          receiverId={selectedUserId}
          onClose={() => {
            setShowChat(false);
            setSelectedUserId(null);
          }}
        />
      )}

      {/* Bottom Spacing */}
      <div className="h-20" />
    </div>
  );
};