"use client";

import React, { useState } from 'react';
import TopicSelector from './components/TopicSelector';
import ConversationInterface from './components/ConversationInterface';

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [conversationStarted, setConversationStarted] = useState(false);

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    setConversationStarted(true);
  };

  const handleReset = () => {
    setSelectedTopic(null);
    setConversationStarted(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          LLM Conversation Playground
        </h1>
        
        {!conversationStarted ? (
          <TopicSelector onTopicSelect={handleTopicSelect} />
        ) : (
          <ConversationInterface 
            topic={selectedTopic!} 
            onReset={handleReset} 
          />
        )}
      </div>
    </div>
  );
}
