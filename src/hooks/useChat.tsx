import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid'; // Import the uuid library for generating unique IDs

// 1. First define the Message type
export type Message = {
  content: string;
  isBot: boolean;
  isLoading?: boolean;
};

// 2. Define the context type
interface ChatContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  conversationId: string | null;
  isProcessing: boolean;
  socket: Socket | null;
}

// 3. Create context with proper typing
const ChatContext = createContext<ChatContextType>({
  messages: [],
  addMessage: () => {},
  conversationId: null,
  isProcessing: false,
  socket: null,
});

// 4. Create custom hook with explicit return type
export const useChat = (): ChatContextType => useContext(ChatContext);

// 5. Define provider props interface
interface ChatProviderProps {
  children: ReactNode;
}

// 6. Implement provider component
export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to the Flask-SocketIO server
    const newSocket = io('http://127.0.0.1:8000'); // Ensure this matches your Flask-SocketIO server URL
    setSocket(newSocket);

    // Join a room for the conversation
    if (conversationId) {
      newSocket.emit('join', { conversation_id: conversationId });
    }

    const handleResponse = (data: { token: string }) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        return last?.isLoading
          ? [
              ...prev.slice(0, -1),
              { ...last, content: last.content + data.token },
            ]
          : prev;
      });
    };

    const handleDone = () => {
      setIsProcessing(false);
      setMessages((prev) => prev.map((msg) => ({ ...msg, isLoading: false })));
    };

    const handleError = (data: { error: string }) => {
      console.error('WebSocket Error:', data.error);
      setIsProcessing(false);
    };

    // Listen for events from the server
    newSocket.on('response', handleResponse);
    newSocket.on('done', handleDone);
    newSocket.on('error', handleError);

    return () => {
      // Leave the room and clean up
      if (conversationId) {
        newSocket.emit('leave', { conversation_id: conversationId });
      }
      newSocket.off('response', handleResponse);
      newSocket.off('done', handleDone);
      newSocket.off('error', handleError);
      newSocket.disconnect();
    };
  }, [conversationId]);

  const addMessage = (message: Message) => {
    // Generate a conversationId if it doesn't exist
    if (!conversationId) {
      const newConversationId = uuidv4(); // Generate a UUID
      setConversationId(newConversationId);
    }

    // Add the message to the state
    setMessages((prev) => [...prev, message]);

    // If the message is from the bot, set the processing state
    if (message.isBot) {
      setIsProcessing(true);
    }

    // Send the message to the WebSocket server
    if (socket) {
      socket.emit('chat', {
        query: message.content,
        conversation_id: conversationId || uuidv4(), // Use the existing or newly created conversation ID
      });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        addMessage,
        conversationId,
        isProcessing,
        socket,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};