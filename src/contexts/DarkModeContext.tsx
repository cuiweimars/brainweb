import React, { createContext, useContext, useState, useEffect } from 'react';

interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: true,
  toggleDarkMode: () => {},
});

export const useDarkMode = () => useContext(DarkModeContext);

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // 检查本地存储的用户偏好
    const savedPreference = localStorage.getItem('darkMode');
    if (savedPreference !== null) {
      return savedPreference === 'true';
    }
    
    // 默认使用暗色模式
    return true;
  });

  useEffect(() => {
    // 保存用户偏好到本地存储
    localStorage.setItem('darkMode', darkMode.toString());
    
    // 应用暗色模式到文档
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export default DarkModeProvider; 