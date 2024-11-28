import { useState, useEffect, useRef } from 'react';
import { useMessageStore } from '../store/messageStore';
import { useAuthStore } from '../store/authStore';
import { Send, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChatProps {
  receiverId: string;
  onClose: () => void;
}

export const Chat = ({ receiverId, onClose }: ChatProps) => {
  const [message, setMessage] = useState('');
  const { user } = useAuthStore();
  const { 
    sendMessage, 
    messages, 
    loading,
    error,
    activeConversation,
    markAsRead
  } = useMessageStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim()) return;

    try {
      await sendMessage(receiverId, message.trim(), user);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center">
        <button
          onClick={onClose}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h2 className="font-semibold">Chat</h2>
          {loading && <span className="text-sm text-gray-500">Chargement...</span>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.senderId === user?.uid ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-4 py-2 ${
                msg.senderId === user?.uid
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p>{msg.content}</p>
              <div
                className={`text-xs mt-1 ${
                  msg.senderId === user?.uid
                    ? 'text-indigo-200'
                    : 'text-gray-500'
                }`}
              >
                {format(msg.createdAt, 'HH:mm', { locale: fr })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!message.trim() || loading}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};