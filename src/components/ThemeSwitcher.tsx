import React, { useEffect } from 'react';

const ThemeSwitcher: React.FC = () => {
  useEffect(() => {
    // Always use dark mode
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  // Return null to not render anything
  return null;
};

export default ThemeSwitcher; 