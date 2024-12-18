"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, RefreshCw } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'Claude' | 'GPT' | 'System' | 'Llama 3.3 70B' | 'Llama 3.2 90B' | 'Mixtral 8x7B';
}

interface ConversationInterfaceProps {
  topic: string;
  onReset: () => void;
}

const ConversationInterface: React.FC<ConversationInterfaceProps> = ({ topic, onReset }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 0, 
      text: `Let's discuss: ${topic}`, 
      sender: 'System' 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    // Prevent multiple simultaneous requests
    if (isLoading) return;

    // Limit total conversation length
    // if (messages.length >= 10) {
    //   setError('Maximum conversation length reached. Please reset.');
    //   return;
    // }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic,
          messages: messages.slice(-5) // Send only last 5 messages for context
        })
      });

      // More robust error handling
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch AI response');
      }

      const data = await response.json();

      const newMessage: Message = {
        id: messages.length,
        text: data.response.text,
        sender: data.response.sender
      };

      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Detailed error generating conversation:', error);
      const errorMessage: Message = {
        id: messages.length,
        text: error instanceof Error 
          ? `Error: ${error.message}` 
          : 'An unexpected error occurred.',
        sender: 'System'
      };
      setMessages(prev => [...prev, errorMessage]);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserIntervention = async () => {
    if (!userInput.trim()) return;

    // Prevent multiple simultaneous requests
    if (isLoading) return;

    // Limit total conversation length
    // if (messages.length >= 10) {
    //   setError('Maximum conversation length reached. Please reset.');
    //   return;
    // }

    setIsLoading(true);
    setError(null);

    // Add user's message to the conversation
    const userMessage: Message = {
      id: messages.length,
      text: userInput,
      sender: 'Claude' // Using 'Claude' to differentiate user messages
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput(''); // Clear input after sending

    try {
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic,
          messages: [...messages, userMessage].slice(-5) // Include user message in context
        })
      });

      // More robust error handling
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch AI response');
      }

      const data = await response.json();

      const newMessage: Message = {
        id: messages.length + 1,
        text: data.response.text,
        sender: data.response.sender
      };

      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Detailed error generating conversation:', error);
      const errorMessage: Message = {
        id: messages.length + 1,
        text: error instanceof Error 
          ? `Error: ${error.message}` 
          : 'An unexpected error occurred.',
        sender: 'System'
      };
      setMessages(prev => [...prev, errorMessage]);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Discussing: {topic}
        </h2>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
        >
          <RefreshCw size={16} /> Reset Topic
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex-grow overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 space-y-4 w-full">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className="flex justify-center w-full"
          >
            <div 
              className={`w-full max-w-full p-3 rounded-lg ${
                msg.sender === 'Llama 3.3 70B'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                  : msg.sender === 'Llama 3.2 90B'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                  : msg.sender === 'Mixtral 8x7B'
                  ? 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200'
                  : msg.sender === 'System'
                  ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  : msg.sender === 'Claude'
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              }`}
            >
              <p>{msg.text}</p>
              <span className="text-xs block text-right mt-1 opacity-70">
                {msg.sender}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-center items-center w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex space-x-2">
        <input 
          type="text" 
          value={userInput} 
          onChange={(e) => setUserInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleUserIntervention()}
          className="flex-grow p-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          placeholder="Intervene in the conversation..."
          disabled={isLoading}
        />
        <button 
          onClick={handleUserIntervention}
          disabled={isLoading || !userInput.trim()}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          <Send size={16} /> Intervene
        </button>
        <button 
          onClick={handleSendMessage}
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          <Send size={16} /> Continue Conversation
        </button>
      </div>
    </div>
  );
};

export default ConversationInterface;
