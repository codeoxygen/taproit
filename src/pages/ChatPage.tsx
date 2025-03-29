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
    addMessage({ content: query, isBot: false });
    addMessage({ content: '', isBot: true, isLoading: true });
    
    socket?.emit('query', {
      query,
      conversation_id: conversationId
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