import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, DocumentData } from 'firebase/firestore';
import { MessageCircle, Clock } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
  otherUser: {
    id: string;
    name: string;
  };
}

export const Messages = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // First, get all conversations where the user is a participant
        const conversationsQuery = query(
          collection(db, 'conversations'),
          where('participants', 'array-contains', user.uid)
        );

        const conversationsSnapshot = await getDocs(conversationsQuery);
        
        // Process conversations and fetch other user details
        const processedConversations = await Promise.all(
          conversationsSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const otherUserId = data.participants.find((id: string) => id !== user.uid);
            
            // Get other user's details from users collection
            try {
              const userDoc = await getDocs(
                query(collection(db, 'users'), where('uid', '==', otherUserId))
              );
              
              const otherUserData = userDoc.docs[0]?.data() || { name: 'Utilisateur inconnu' };

              return {
                id: doc.id,
                ...data,
                otherUser: {
                  id: otherUserId,
                  name: otherUserData.name,
                },
              };
            } catch (error) {
              console.error('Error fetching user details:', error);
              return {
                id: doc.id,
                ...data,
                otherUser: {
                  id: otherUserId,
                  name: 'Utilisateur inconnu',
                },
              };
            }
          })
        );

        setConversations(processedConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setError('Impossible de charger les conversations. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <MessageCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-indigo-600 hover:text-indigo-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucune conversation pour le moment</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                  <div>
                    <div className="font-medium">{conversation.otherUser.name}</div>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(conversation.lastMessageDate).toLocaleDateString()}
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="mt-1 bg-indigo-600 text-white text-xs rounded-full px-2 py-1 inline-block">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};