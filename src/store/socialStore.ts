import { create } from 'zustand';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc,
  updateDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';

interface SocialState {
  followers: string[];
  following: string[];
  loading: boolean;
  error: string | null;
  followUser: (userId: string, currentUserId: string) => Promise<void>;
  unfollowUser: (userId: string, currentUserId: string) => Promise<void>;
  fetchFollowers: (userId: string) => Promise<void>;
  fetchFollowing: (userId: string) => Promise<void>;
}

export const useSocialStore = create<SocialState>((set, get) => ({
  followers: [],
  following: [],
  loading: false,
  error: null,

  followUser: async (userId: string, currentUserId: string) => {
    try {
      set({ loading: true, error: null });

      // Add follow relationship
      await addDoc(collection(db, 'follows'), {
        followerId: currentUserId,
        followingId: userId,
        createdAt: serverTimestamp()
      });

      // Update follower count
      await updateDoc(doc(db, 'users', userId), {
        followerCount: increment(1)
      });

      // Update following count
      await updateDoc(doc(db, 'users', currentUserId), {
        followingCount: increment(1)
      });

      // Refresh followers list
      await get().fetchFollowers(userId);
      
      set({ loading: false });
    } catch (error) {
      console.error('Error following user:', error);
      set({ error: 'Failed to follow user', loading: false });
    }
  },

  unfollowUser: async (userId: string, currentUserId: string) => {
    try {
      set({ loading: true, error: null });

      // Find and delete follow relationship
      const q = query(
        collection(db, 'follows'),
        where('followerId', '==', currentUserId),
        where('followingId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const followDoc = querySnapshot.docs[0];
      
      if (followDoc) {
        await deleteDoc(followDoc.ref);

        // Update follower count
        await updateDoc(doc(db, 'users', userId), {
          followerCount: increment(-1)
        });

        // Update following count
        await updateDoc(doc(db, 'users', currentUserId), {
          followingCount: increment(-1)
        });

        // Refresh followers list
        await get().fetchFollowers(userId);
      }

      set({ loading: false });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      set({ error: 'Failed to unfollow user', loading: false });
    }
  },

  fetchFollowers: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      const q = query(
        collection(db, 'follows'),
        where('followingId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const followers = querySnapshot.docs.map(doc => doc.data().followerId);

      set({ followers, loading: false });
    } catch (error) {
      console.error('Error fetching followers:', error);
      set({ error: 'Failed to fetch followers', loading: false });
    }
  },

  fetchFollowing: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      const q = query(
        collection(db, 'follows'),
        where('followerId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const following = querySnapshot.docs.map(doc => doc.data().followingId);

      set({ following, loading: false });
    } catch (error) {
      console.error('Error fetching following:', error);
      set({ error: 'Failed to fetch following', loading: false });
    }
  }
}));