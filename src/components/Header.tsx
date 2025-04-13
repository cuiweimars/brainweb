import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

// Mock data for categories (should be moved to a common data file later)
const categories = [
  { id: 'memory', name: 'Memory', icon: '🧠', count: 12 },
  { id: 'attention', name: 'Attention', icon: '👁️', count: 8 },
  { id: 'logic', name: 'Logic', icon: '🧩', count: 15 },
  { id: 'math', name: 'Math', icon: '🔢', count: 10 },
  { id: 'language', name: 'Language', icon: '🔤', count: 7 },
];

const Header: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsCategoriesOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isCategoriesOpen) setIsCategoriesOpen(false);
    if (isSearchOpen) setIsSearchOpen(false);
  };

  const toggleCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen);
    if (isMenuOpen) setIsMenuOpen(false);
    if (isSearchOpen) setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isMenuOpen) setIsMenuOpen(false);
    if (isCategoriesOpen) setIsCategoriesOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm) {
      console.log(`Navigating to search page for: ${trimmedSearchTerm}`);
      navigate(`/search?q=${encodeURIComponent(trimmedSearchTerm)}`);
      setIsSearchOpen(false);
      setSearchTerm('');
    }
  };

  // Logo component to reuse in both desktop and mobile views
  const Logo = () => (
    <Link to="/" className="flex items-center p-2">
      <div className="bg-purple-800 rounded-md p-2 flex items-center shadow-md mr-3">
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21.17,2.06A13.1,13.1,0,0,0,19,1.87a12.94,12.94,0,0,0-7,2.05,12.94,12.94,0,0,0-7-2,13.1,13.1,0,0,0-2.17.19,1,1,0,0,0-.83,1v12a1,1,0,0,0,1.17,1,10.9,10.9,0,0,1,8.25,1.91l.12.07.13,0a.91.91,0,0,0,.53,0l.13,0,.12-.07A10.9,10.9,0,0,1,20.83,16a1,1,0,0,0,1.17-1v-12A1,1,0,0,0,21.17,2.06ZM11,15.35a12.87,12.87,0,0,0-6-1.48c-.33,0-.66,0-1,0v-10a8.69,8.69,0,0,1,1,0,10.86,10.86,0,0,1,6,1.8Zm9-1.44c-.34,0-.67,0-1,0a12.87,12.87,0,0,0-6,1.48V5.67a10.86,10.86,0,0,1,6-1.8,8.69,8.69,0,0,1,1,0Z" />
        </svg>
      </div>
      <span className="text-xl font-bold text-white">
        {t('app_name', 'BrainWeb')}
      </span>
    </Link>
  );

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm fixed top-0 left-0 w-full z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Logo />
          </div>

          <div className="hidden md:flex flex-1 items-center justify-center px-4">
            <div className="w-full max-w-lg">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('search_games')}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-4 pl-10 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
              </form>
            </div>
          </div>

          <div className="flex items-center flex-shrink-0">
            <div className="ml-3">
              <LanguageSwitcher />
            </div>

            <div className="-mr-2 flex md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 focus:outline-none"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={toggleMenu}
              >
                <span className="sr-only">
                  {isMenuOpen ? t('close_menu') : t('open_menu')}
                </span>
                {isMenuOpen ? (
                  <svg
                    className="block h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden py-2 px-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder={t('search_games')}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-4 pl-10 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-5 w-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        </form>
      </div>

      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-900"
            >
              {t('home', 'Home')}
            </Link>
            <Link
              to="/recent"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-900"
            >
              {t('recently_played', 'Recently')}
            </Link>
            <Link
              to="/new"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-900"
            >
              {t('new', 'New')}
            </Link>
            <Link
              to="/trending"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-900"
            >
              {t('trending', 'Trending')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
