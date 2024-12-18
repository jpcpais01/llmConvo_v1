"use client";

import React, { useState } from 'react';

const PREDEFINED_TOPICS = [
  'The Future of AI',
  'Climate Change Solutions',
  'Space Exploration',
  'Ethics in Technology',
  'Global Economic Trends',
  'Artificial Intelligence and Creativity',
  'Sustainable Development',
  'Quantum Computing Breakthroughs'
];

interface TopicSelectorProps {
  onTopicSelect: (topic: string) => void;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ onTopicSelect }) => {
  const [customTopic, setCustomTopic] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handlePredefinedTopicSelect = (topic: string) => {
    setError(null);
    onTopicSelect(topic);
  };

  const handleCustomTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTopic = customTopic.trim();
    
    // Add more robust topic validation
    if (trimmedTopic.length < 3) {
      setError('Topic must be at least 3 characters long');
      return;
    }

    if (trimmedTopic.length > 100) {
      setError('Topic must be less than 100 characters');
      return;
    }

    // Optional: Add basic profanity filter
    const profanityFilter = /\b(fuck|shit|damn|hate|stupid|bad|offensive|inappropriate)\b/i;
    if (profanityFilter.test(trimmedTopic)) {
      setError('Please choose a more appropriate topic');
      return;
    }

    onTopicSelect(trimmedTopic);
    setCustomTopic(''); // Clear input after successful submission
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {PREDEFINED_TOPICS.map((topic) => (
          <button
            key={topic}
            onClick={() => handlePredefinedTopicSelect(topic)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {topic}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="border-t border-gray-300 dark:border-gray-600 my-6 relative">
        <span className="absolute left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-4 text-gray-500 dark:text-gray-300">
          OR
        </span>
      </div>

      <form onSubmit={handleCustomTopicSubmit} className="flex flex-col space-y-2">
        <input
          type="text"
          value={customTopic}
          onChange={(e) => {
            setError(null);
            setCustomTopic(e.target.value);
          }}
          placeholder="Enter your own topic"
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Start Conversation
        </button>
      </form>
    </div>
  );
};

export default TopicSelector;
