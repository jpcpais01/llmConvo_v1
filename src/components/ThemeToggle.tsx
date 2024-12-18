'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Determine initial theme
    const initialTheme = savedTheme 
      ? savedTheme === 'dark' 
      : prefersDarkMode;

    setIsDarkMode(initialTheme);
    updateTheme(initialTheme);
    setIsMounted(true);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
        updateTheme(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    updateTheme(newTheme);
    
    // Explicitly save user's choice
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const updateTheme = (isDark: boolean) => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      document.body.classList.add('dark-mode');
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      document.body.classList.remove('dark-mode');
    }
  };

  // Prevent rendering until mounted to avoid hydration issues
  if (!isMounted) {
    return null;
  }

  return (
    <button 
      onClick={toggleTheme} 
      className="p-2 rounded-full bg-secondary/20 text-foreground hover:bg-secondary/40 transition-colors"
      aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600" />
      )}
    </button>
  );
}
