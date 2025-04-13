import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { categories } from '../data/mockData';

// 图标组件
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const RecentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const NewIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const TrendingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const UpdatedIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const OriginalsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const MultiplayerIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const TagsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const AboutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TermsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const PrivacyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

// Define Social Icons
const TiktokIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.317 4.369a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.078.037c-.21.375-.443.805-.61 1.195a18.285 18.285 0 00-5.484 0 12.941 12.941 0 00-.61-1.195.074.074 0 00-.078-.037 19.736 19.736 0 00-4.885 1.515.069.069 0 00-.032.052c-.189.985-.297 1.994-.315 3.011a.061.061 0 00.029.057 19.9 19.9 0 005.984 4.604.074.074 0 00.087-.004 15.177 15.177 0 001.064-1.097.06.06 0 00-.018-.085 13.06 13.06 0 01-1.266-.831.069.069 0 01.014-.116l.014-.01a11.1 11.1 0 001.89-.473.07.07 0 01.07-.002 10.388 10.388 0 005.576 0 .07.07 0 01.07.002 11.14 11.14 0 001.89.474l.013.01a.069.069 0 01.014.116 12.987 12.987 0 01-1.266.83.061.061 0 00-.018.086 14.99 14.99 0 001.064 1.096.074.074 0 00.087.004 19.908 19.908 0 005.984-4.604.061.061 0 00.03-.057c-.018-1.017-.126-2.026-.315-3.01a.069.069 0 00-.033-.053zM8.03 15.166c-.837 0-1.518-.732-1.518-1.636s.68-1.636 1.518-1.636c.837 0 1.518.732 1.518 1.636s-.68 1.636-1.518 1.636zm7.94 0c-.837 0-1.518-.732-1.518-1.636s.68-1.636 1.518-1.636c.837 0 1.518.732 1.518 1.636.001.904-.68 1.636-1.518 1.636z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.986 3.43 0 4.92 0 8.757v6.486c0 3.837.986 5.327 4.385 5.571 3.6.245 11.626.246 15.23 0 3.4-.244 4.385-1.734 4.385-5.571V8.757c0-3.837-.985-5.327-4.385-5.573zM9.545 15.568V7.941l6.476 3.813-6.476 3.814z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
);

// 主要导航项
const mainNavItems = [
  { id: 'home', name: 'Home', icon: HomeIcon, path: '/' },
  { id: 'recently_played', name: 'Recently', icon: RecentIcon, path: '/recent' },
  { id: 'new', name: 'New', icon: NewIcon, path: '/new' },
  { id: 'trending', name: 'Trending', icon: TrendingIcon, path: '/trending' }
];

// 底部导航项
const footerNavItems = [
  { id: 'about', name: 'About', icon: AboutIcon, path: '/about' },
  { id: 'terms', name: 'Terms & Conditions', icon: TermsIcon, path: '/terms' },
  { id: 'privacy', name: 'Privacy', icon: PrivacyIcon, path: '/privacy' }
];

// Social links data
const socialLinks = [
  { id: 'tiktok', name: 'TikTok', icon: TiktokIcon, url: 'https://tiktok.com' }, // Replace with actual URL
  { id: 'discord', name: 'Discord', icon: DiscordIcon, url: 'https://discord.com' }, // Replace with actual URL
  { id: 'linkedin', name: 'LinkedIn', icon: LinkedinIcon, url: 'https://linkedin.com' }, // Replace with actual URL
  { id: 'youtube', name: 'YouTube', icon: YoutubeIcon, url: 'https://youtube.com' }, // Replace with actual URL
  { id: 'twitter', name: 'Twitter', icon: TwitterIcon, url: 'https://twitter.com' }, // Replace with actual URL
];

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const [categoriesExpanded, setCategoriesExpanded] = React.useState(true);

  // Calculate dynamic bottom padding based on footer content height
  const footerSectionHeight = '7rem'; // Estimate height of footer links + social links section
  const navBottomPadding = `calc(100px + ${footerSectionHeight})`;

  return (
    <aside className="w-full h-full bg-gray-900 dark:bg-gray-950 text-white flex flex-col relative">
      {/* Logo Section removed */}
      
      {/* Main navigation - Adjust padding bottom */}
      <nav className={`space-y-1 mb-4 flex-grow overflow-y-auto pt-4 px-2 pb-[${navBottomPadding}]`}>
        {mainNavItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className="flex items-center px-2 py-2 text-sm font-medium text-gray-300 hover:bg-purple-900 hover:text-purple-200 rounded-md"
          >
            <item.icon />
            <span className="ml-3">{t(item.id, item.name)}</span>
          </Link>
        ))}
        
        {/* Categories Section */}
        <div className="border-t border-gray-700 pt-3 my-3">
          <button
            onClick={() => setCategoriesExpanded(!categoriesExpanded)}
            className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-gray-300 hover:bg-purple-900 hover:text-purple-200 rounded-md"
          >
            <div className="flex items-center">
              <TagsIcon />
              <span className="ml-3">{t('categories', 'Categories')}</span>
            </div>
            <svg
              className={`h-5 w-5 transition-transform ${categoriesExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {categoriesExpanded && (
          <div className="pl-2 space-y-1">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-purple-900 hover:text-purple-200"
              >
                <span className="mr-3">{category.icon}</span>
                <span>{t(category.name)}</span>
                <span className="ml-auto bg-purple-700 text-white text-xs font-semibold rounded-full px-2 py-0.5 min-w-[1.5rem] text-center">{category.count}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* 底部菜单 - Absolutely positioned Container */}
      <div className="absolute bottom-[100px] left-0 right-0 border-t border-gray-700 p-2 bg-gray-900 dark:bg-gray-950">
        {/* Footer Nav Links */}
        <div> 
          {footerNavItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-purple-900 hover:text-purple-200"
            >
              <item.icon />
              <span className="ml-3">{t(item.id, item.name)}</span>
            </Link>
          ))}
        </div>
        {/* Social Media Links - Added below footer links */} 
        <div className="flex justify-center space-x-4 mt-4 pt-3 border-t border-gray-800">
          {socialLinks.map((social) => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              title={social.name}
              className="text-gray-400 hover:text-purple-300 transition-colors"
            >
              <span className="sr-only">{social.name}</span>
              <social.icon />
            </a>
          ))}
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
