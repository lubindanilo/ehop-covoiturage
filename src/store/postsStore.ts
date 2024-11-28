import { create } from 'zustand';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
  enableIndexedDbPersistence
} from 'firebase/firestore';

interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: string;
}

interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
  fetchUserPosts: (userId: string) => Promise<void>;
  loadMorePosts: (userId: string) => Promise<void>;
  clearPosts: () => void;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  loading: false,
  error: null,
  lastVisible: null,
  hasMore: true,

  clearPosts: () => {
    set({
      posts: [],
      lastVisible: null,
      hasMore: true,
      error: null
    });
  },

  fetchUserPosts: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Post[];
        
        set({
          posts: fetchedPosts,
          lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1],
          hasMore: querySnapshot.docs.length === 10,
          loading: false,
          error: null
        });
      } else {
        set({ 
          posts: [], 
          lastVisible: null, 
          hasMore: false, 
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      set({ 
        error: 'Une erreur est survenue lors du chargement des publications', 
        loading: false 
      });
    }
  },

  loadMorePosts: async (userId: string) => {
    const { lastVisible, loading, hasMore } = get();
    if (!lastVisible || loading || !hasMore) return;

    try {
      set({ loading: true });
      
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const morePosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Post[];
        
        set(state => ({
          posts: [...state.posts, ...morePosts],
          lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1],
          hasMore: querySnapshot.docs.length === 10,
          loading: false,
          error: null
        }));
      } else {
        set({ hasMore: false, loading: false });
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
      set({ 
        error: 'Une erreur est survenue lors du chargement des publications supplémentaires', 
        loading: false 
      });
    }
  }
}));