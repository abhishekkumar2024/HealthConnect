import { Search, Bell, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useDarkMode } from '../contextAPI/contextApi';
import { UserProfileMenu } from './Profile.js';
import { NotificationQueue } from './Notification.js';

const NavBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { isDarkMode, toggleDarkMode, themeStyles } = useDarkMode();

  return (
    <nav className={`${themeStyles.navBg} shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-8 flex-1">
            <h1 className={`text-2xl font-bold ${themeStyles.text}`}>HealthConnect</h1>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-2xl">
              <input
                type="text"
                placeholder="Search for doctors, specialties..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${themeStyles.inputBg} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${themeStyles.iconColor}`} />
            </div>
          </div>

          {/* Right Navigation Items */}
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${themeStyles.buttonHoverBg} ${themeStyles.iconColor}`}
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <NotificationQueue />

            {/* User Profile Menu */}
            <UserProfileMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};

export { NavBar };
