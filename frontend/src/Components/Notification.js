import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, BellRing, MessageCircle, Trash2 } from 'lucide-react';
import { useDarkMode } from '../contextAPI/contextApi';
import { fetchallNotifications } from '../api/notification.api';

const NotificationQueue = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isDarkMode, themeStyles } = useDarkMode();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef(null);
  // Fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await fetchallNotifications();
        setNotifications(response.data);
        // Count unread notifications
        const unread = response.data.filter(
          (notification) => !notification.isReadPatient
        ).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id) => {
    // This would typically call an API to mark notification as read
    setNotifications(
      notifications.map((notification, index) => 
        index === id ? { ...notification, isReadPatient: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

   // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

  const clearNotification = (id) => {
    const updatedNotifications = notifications.filter((_, index) => index !== id);
    setNotifications(updatedNotifications);
    // Update unread count
    const unread = updatedNotifications.filter(
      (notification) => !notification.isReadPatient
    ).length;
    setUnreadCount(unread);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };
 
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
              className={`p-2 rounded-full ${themeStyles.buttonHoverBg} ${themeStyles.iconColor}`}
              onClick={() => {
          setIsOpen((prev) => !prev);
        }}
        aria-label="Notifications"
      >
        {isOpen ? (
          <BellRing className="h-5 w-5" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        
        {/* Notification Counter Badge */}
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 ${themeStyles.buttonBg} text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse`}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div
          className={`absolute top-16 right-0 w-80 md:w-96 ${themeStyles.shadowEffect} rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} z-50 overflow-hidden transform transition-all duration-300 ease-in-out origin-top-right`}
        >
          {/* Header */}
          <div className={`flex justify-between items-center p-4 border-b ${themeStyles.borderColor}`}>
            <h3 className={`text-lg font-semibold flex items-center ${themeStyles.text}`}>
              <BellRing className={`h-5 w-5 mr-2 ${themeStyles.iconColor}`} />
              Notifications
              {unreadCount > 0 && (
                <span className={`ml-2 text-xs ${themeStyles.buttonBg} text-white px-2 py-1 rounded-full`}>
                  {unreadCount} new
                </span>
              )}
            </h3>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <button 
                  onClick={clearAll}
                  className={`${themeStyles.subtext} hover:text-red-500 transition-colors duration-200`}
                  title="Clear all notifications"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className={`${themeStyles.subtext} ${isDarkMode ? 'hover:text-purple-300' : 'hover:text-teal-500'} transition-colors duration-200`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${isDarkMode ? 'border-purple-400' : 'border-teal-500'}`}></div>
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      notification.isReadPatient 
                        ? isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                        : isDarkMode 
                          ? 'bg-purple-900/20 border-l-4 border-purple-400' 
                          : 'bg-teal-50 border-l-4 border-teal-500'
                    } flex items-start transition-all duration-200 ${themeStyles.shadowEffect} group ${isDarkMode ? 'hover:bg-gray-700/80' : 'hover:bg-gray-100'}`}
                  >
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className={`font-semibold text-sm ${themeStyles.text}`}>{notification.doctor}</p>
                        <small className={`${themeStyles.subtext} text-xs`}>{notification.slot}</small>
                      </div>
                      <p className={`text-sm mt-1 ${themeStyles.text}`}>{notification.message}</p>
                    </div>
                    <div className="flex flex-col gap-2 ml-2 opacity-70 group-hover:opacity-100">
                      {!notification.isReadPatient && (
                        <button 
                          onClick={() => markAsRead(index)}
                          className={`p-1 rounded-full ${isDarkMode ? 'bg-green-900/40 hover:bg-green-800' : 'bg-green-100 hover:bg-green-200'} transition-colors`}
                          title="Mark as read"
                        >
                          <Check className={`h-4 w-4 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} />
                        </button>
                      )}
                      <button 
                        onClick={() => clearNotification(index)}
                        className={`p-1 rounded-full ${isDarkMode ? 'bg-red-900/40 hover:bg-red-800' : 'bg-red-100 hover:bg-red-200'} transition-colors`}
                        title="Remove notification"
                      >
                        <X className={`h-4 w-4 ${isDarkMode ? 'text-red-300' : 'text-red-600'}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center py-8 ${themeStyles.subtext}`}>
                <Bell className="h-12 w-12 mb-3 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-sm mt-1">When you receive notifications, they'll appear here</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className={`p-3 border-t ${themeStyles.borderColor} text-center`}>
            <button 
              className={`text-sm ${themeStyles.accentText} hover:underline`}
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};



export { NotificationQueue };