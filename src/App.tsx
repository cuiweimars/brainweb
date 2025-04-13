import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import GameDetailPage from './pages/GameDetailPage';
import RecentGamesPage from './pages/RecentGamesPage';
import NewGamesPage from './pages/NewGamesPage';
import TrendingGamesPage from './pages/TrendingGamesPage';
import CategoryPage from './pages/CategoryPage';
import AllGamesPage from './pages/AllGamesPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import SearchResultsPage from './pages/SearchResultsPage';

const App = () => {
  return (
    <HelmetProvider>
      <UserProvider>
        <DarkModeProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/game/:gameId" element={<GameDetailPage />} />
                <Route path="/recent" element={<RecentGamesPage />} />
                <Route path="/new" element={<NewGamesPage />} />
                <Route path="/trending" element={<TrendingGamesPage />} />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route path="/games" element={<AllGamesPage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </DarkModeProvider>
      </UserProvider>
    </HelmetProvider>
  );
};

export default App;
