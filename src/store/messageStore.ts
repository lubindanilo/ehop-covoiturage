import { create } from 'zustand';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDocs,
  updateDoc,
  doc
} from 'firebase/firestore';
import { User } from 'firebase/auth';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageDate: Date;
  unreadCount: number;
}

interface MessageState {
  messages: Message[];
  conversations: Conversation[];
  activeConversation: string | null;
  loading: boolean;
  error: string | null;
  sendMessage: (receiverId: string, content: string, currentUser: User) => Promise<void>;
  fetchConversations: (userId: string) => Promise<void>;
  setActiveConversation: (conversationId: string) => void;
  markAsRead: (messageIds: string[]) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  conversations: [],
  activeConversation: null,
  loading: false,
  error: null,

  sendMessage: async (receiverId: string, content: string, currentUser: User) => {
    try {
      set({ loading: true, error: null });

      // Find or create conversation
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      
      let conversationId = '';
      let conversation = querySnapshot.docs.find(doc => 
        doc.data().participants.includes(receiverId)
      );

      if (conversation) {
        conversationId = conversation.id;
      } else {
        const newConversation = await addDoc(conversationsRef, {
          participants: [currentUser.uid, receiverId],
          lastMessage: content,
          lastMessageDate: serverTimestamp(),
          unreadCount: 1
        });
        conversationId = newConversation.id;
      }

      // Add message
      await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId: currentUser.uid,
        receiverId,
        content,
        createdAt: serverTimestamp(),
        read: false
      });

      // Update conversation
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: content,
        lastMessageDate: serverTimestamp(),
        unreadCount: conversation ? conversation.data().unreadCount + 1 : 1
      });

      set({ loading: false });
    } catch (error) {
      console.error('Error sending message:', error);
      set({ error: 'Failed to send message', loading: false });
    }
  },

  fetchConversations: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      const unsubscribe = onSnapshot(
        query(
          collection(db, 'conversations'),
          where('participants', 'array-contains', userId),
          orderBy('lastMessageDate', 'desc')
        ),
        (snapshot) => {
          const conversations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Conversation[];
          
          set({ conversations, loading: false });
        },
        (error) => {
          console.error('Error fetching conversations:', error);
          set({ error: 'Failed to fetch conversations', loading: false });
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up conversations listener:', error);
      set({ error: 'Failed to setup conversations listener', loading: false });
    }
  },

  setActiveConversation: (conversationId: string) => {
    set({ activeConversation: conversationId });
  },

  markAsRead: async (messageIds: string[]) => {
    try {
      set({ loading: true, error: null });

      const batch = db.batch();
      messageIds.forEach(id => {
        const messageRef = doc(db, 'messages', id);
        batch.update(messageRef, { read: true });
      });

      await batch.commit();
      set({ loading: false });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      set({ error: 'Failed to mark messages as read', loading: false });
    }
  }
}));