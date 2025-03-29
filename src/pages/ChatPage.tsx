import React, { useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { ChatMessage } from '../components/ChatMessage';
import { InputArea } from '../components/InputArea';

export const ChatPage: React.FC = () => {
  const { 
    messages, 
    addMessage, 
    conversationId, 
    isProcessing,
    socket 
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (query: string) => {
    // Add the user's message
    addMessage({ content: query, isBot: false });

    // Add a placeholder for the bot's response
    addMessage({ content: '', isBot: true, isLoading: true });

    // Emit the query and conversation ID to the WebSocket server
    socket?.emit('chat', {
      query,
      conversation_id: conversationId, // Use the conversationId from the hook
    });
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <InputArea onSubmit={handleSubmit} isLoading={isProcessing} />
    </div>
  );
};