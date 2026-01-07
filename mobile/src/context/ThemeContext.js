import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  
  const toggleTheme = () => setIsDark(!isDark);
  
  const colors = isDark ? {
    primary: '#0066FF',
    secondary: '#00D4AA',
    background: '#0a0f1c',
    text: '#FFFFFF',
    card: '#1e293b'
  } : {
    primary: '#0066FF',
    secondary: '#00D4AA',
    background: '#FFFFFF',
    text: '#000000',
    card: '#F3F4F6'
  };
  
  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
