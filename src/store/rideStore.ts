import { create } from 'zustand';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

interface RidePreference {
  id?: string;
  userId: string;
  section: 'morning' | 'evening';
  role: 'driver' | 'passenger';
  active: boolean;
  createdAt: string;
}

interface RideStore {
  preferences: RidePreference[];
  loading: boolean;
  setPreference: (preference: Omit<RidePreference, 'id' | 'createdAt'>) => Promise<void>;
  fetchUserPreferences: (userId: string) => Promise<void>;
  togglePreferenceStatus: (preferenceId: string, active: boolean) => Promise<void>;
}

export const useRideStore = create<RideStore>((set, get) => ({
  preferences: [],
  loading: false,

  setPreference: async (preference) => {
    try {
      set({ loading: true });
      // Check for existing preference
      const q = query(
        collection(db, 'ridePreferences'),
        where('userId', '==', preference.userId),
        where('section', '==', preference.section)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Update existing preference
        const docRef = doc(db, 'ridePreferences', querySnapshot.docs[0].id);
        await updateDoc(docRef, {
          ...preference,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Create new preference
        await addDoc(collection(db, 'ridePreferences'), {
          ...preference,
          createdAt: new Date().toISOString()
        });
      }
      
      await get().fetchUserPreferences(preference.userId);
    } catch (error) {
      console.error('Error setting ride preference:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchUserPreferences: async (userId: string) => {
    try {
      set({ loading: true });
      const q = query(
        collection(db, 'ridePreferences'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const preferences = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RidePreference));
      set({ preferences });
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  togglePreferenceStatus: async (preferenceId: string, active: boolean) => {
    try {
      set({ loading: true });
      const docRef = doc(db, 'ridePreferences', preferenceId);
      await updateDoc(docRef, { active });
      
      const preferences = get().preferences.map(pref =>
        pref.id === preferenceId ? { ...pref, active } : pref
      );
      set({ preferences });
    } catch (error) {
      console.error('Error toggling preference status:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));