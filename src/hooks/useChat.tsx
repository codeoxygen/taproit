import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';

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
  const [conversationId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://127.0.0.1:8000');
    setSocket(newSocket);

    const handleResponse = (data: { token: string }) => {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        return last?.isLoading  
          ? [
              ...prev.slice(0, -1),
              { ...last, content: last.content + data.token }
            ]
          : prev;
      });
    };

    const handleDone = () => {
      setIsProcessing(false);
      setMessages(prev => prev.map(msg => ({ ...msg, isLoading: false })));
    };

    newSocket.on('response', handleResponse);
    newSocket.on('done', handleDone);

    return () => {
      newSocket.off('response', handleResponse);
      newSocket.off('done', handleDone);
      newSocket.disconnect();
    };
  }, []);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    if (message.isBot) {
      setIsProcessing(true);
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