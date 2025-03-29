import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../hooks/useChat';

export const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <div className={`message ${message.isBot ? 'bot' : 'user'}`}>
      <div className="message-content">
        {message.isBot ? (
          <>
            <ReactMarkdown>{message.content}</ReactMarkdown>
            {message.isLoading && <span className="loading-indicator">...</span>}
          </>
        ) : (
          message.content
        )}
      </div>
    </div>
  );
};