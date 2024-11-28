import { create } from 'zustand';
import { auth, db, storage } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword as firebaseUpdatePassword,
  deleteUser,
  User,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { UserProfile, DriverPreferences } from '../types/user';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, userData: Partial<UserProfile> & { driverPreferences?: DriverPreferences }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  clearError: () => set({ error: null }),
  
  signUp: async (email, password, userData) => {
    try {
      set({ loading: true, error: null });
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      let photoURL;
      if (userData.profileImage) {
        const imageRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(imageRef, userData.profileImage);
        photoURL = await getDownloadURL(imageRef);
      }

      const userProfile: UserProfile = {
        id: user.uid,
        email,
        name: `${userData.firstName} ${userData.lastName}`,
        photoURL,
        description: '',
        followerCount: 0,
        followingCount: 0,
        driverPreferences: userData.driverPreferences,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      set({ user, loading: false, error: null });
    } catch (error) {
      const authError = error as AuthError;
      set({ loading: false, error: authError.message });
      throw error;
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      set({ user, loading: false, error: null });
    } catch (error) {
      const authError = error as AuthError;
      set({ loading: false, error: authError.message });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      await firebaseSignOut(auth);
      set({ user: null, loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: 'Erreur lors de la déconnexion' });
      throw error;
    }
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    try {
      set({ loading: true, error: null });
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('User not found');
      
      // Reauthenticate first
      await signInWithEmailAndPassword(auth, user.email, currentPassword);
      await firebaseUpdatePassword(user, newPassword);
      
      set({ loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: 'Erreur lors du changement de mot de passe' });
      throw error;
    }
  },

  deleteAccount: async () => {
    try {
      set({ loading: true, error: null });
      const user = auth.currentUser;
      if (!user) throw new Error('User not found');

      // Delete user data
      await deleteDoc(doc(db, 'users', user.uid));

      // Delete profile picture if exists
      try {
        const imageRef = ref(storage, `avatars/${user.uid}`);
        await deleteObject(imageRef);
      } catch (error) {
        console.log('No profile picture to delete');
      }

      // Delete user posts
      const postsQuery = query(collection(db, 'posts'), where('userId', '==', user.uid));
      const postsSnapshot = await getDocs(postsQuery);
      for (const doc of postsSnapshot.docs) {
        await deleteDoc(doc.ref);
      }

      // Finally delete the user account
      await deleteUser(user);
      set({ user: null, loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: 'Erreur lors de la suppression du compte' });
      throw error;
    }
  }
}));