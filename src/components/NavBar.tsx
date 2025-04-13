import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from '../contexts/DarkModeContext';

interface NavBarProps {
  transparent?: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ transparent = false }) => {
  const { t } = useTranslation();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !transparent 
          ? 'bg-white/95 backdrop-blur-md dark:bg-gray-900/95 shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/assets/logo.svg" 
                alt="BrainWeb Logo" 
                className="h-8 w-auto mr-2"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                BrainWeb
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              <NavLink href="/" active={isActive('/')}>
                {t('home')}
              </NavLink>
              <NavLink href="/categories" active={isActive('/categories')}>
                {t('categories')}
              </NavLink>
              <NavLink href="/featured" active={isActive('/featured')}>
                {t('featured')}
              </NavLink>
              <NavLink href="/new" active={isActive('/new')}>
                {t('new_games')}
              </NavLink>
              <NavLink href="/about" active={isActive('/about')}>
                {t('about')}
              </NavLink>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
              aria-label={darkMode ? t('light_mode') : t('dark_mode')}
            >
              {darkMode ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
            
            <Link
              to="/login"
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
            >
              {t('login')}
            </Link>
            
            <Link
              to="/signup"
              className="rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-4 py-2 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all"
            >
              {t('sign_up')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleDarkMode}
              className="mr-2 rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              aria-label={darkMode ? t('light_mode') : t('dark_mode')}
            >
              {darkMode ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
            
            <button
              onClick={toggleMenu}
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              aria-label={isMenuOpen ? t('close_menu') : t('open_menu')}
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        isMenuOpen 
          ? 'max-h-screen opacity-100 visible' 
          : 'max-h-0 opacity-0 invisible'
      }`}>
        <div className="bg-white/95 backdrop-blur-md dark:bg-gray-900/95 shadow-lg px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <MobileNavLink href="/" active={isActive('/')}>
            {t('home')}
          </MobileNavLink>
          <MobileNavLink href="/categories" active={isActive('/categories')}>
            {t('categories')}
          </MobileNavLink>
          <MobileNavLink href="/featured" active={isActive('/featured')}>
            {t('featured')}
          </MobileNavLink>
          <MobileNavLink href="/new" active={isActive('/new')}>
            {t('new_games')}
          </MobileNavLink>
          <MobileNavLink href="/about" active={isActive('/about')}>
            {t('about')}
          </MobileNavLink>
          
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <svg className="h-10 w-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6zm0 2c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0 4c4.42 0 8 1.79 8 4H4c0-2.21 3.58-4 8-4z" />
                </svg>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-white">{t('guest')}</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('please_login')}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 px-2">
              <Link
                to="/login"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                {t('login')}
              </Link>
              <Link
                to="/signup"
                className="block rounded-md px-3 py-2 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {t('sign_up')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink: React.FC<{ href: string; active: boolean; children: React.ReactNode }> = ({
  href,
  active,
  children,
}) => (
  <Link
    to={href}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink: React.FC<{ href: string; active: boolean; children: React.ReactNode }> = ({
  href,
  active,
  children,
}) => (
  <Link
    to={href}
    className={`block px-3 py-2 rounded-md text-base font-medium ${
      active
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
    }`}
  >
    {children}
  </Link>
);

export default NavBar; 