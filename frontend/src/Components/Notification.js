import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, MessageCircle, Check } from 'lucide-react';
import { useDarkMode } from '../contextAPI/contextApi';

const NotificationQueue = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { themeStyles } = useDarkMode();
  const dropdownRef = useRef(null);
    
  // Rest of the state management and handlers remain the same
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  useEffect(() => {
      
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full hover:${themeStyles.iconHoverBg} ${themeStyles.iconColor}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg ${themeStyles.cardBg} border ${themeStyles.borderColor} max-h-[80vh] overflow-hidden`}>
          {/* Header */}
          <div className={`p-3 border-b ${themeStyles.borderColor} flex justify-between items-center`}>
            <h3 className={`font-semibold ${themeStyles.text}`}>Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className={`text-sm ${themeStyles.linkHover}`}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[60vh]">
            {notifications.length === 0 ? (
              <div className={`p-4 text-center ${themeStyles.subtext}`}>
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 border-b ${themeStyles.borderColor} hover:${themeStyles.buttonHoverBg} transition-colors ${
                    !notification.isRead ? `${themeStyles.inputBg}` : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 ${themeStyles.iconColor}`}>
                        {notification.type === 'message' ? (
                          <MessageCircle className="h-5 w-5" />
                        ) : (
                          <Bell className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${themeStyles.text}`}>
                          {notification.title}
                        </p>
                        <p className={`text-sm ${themeStyles.subtext}`}>
                          {notification.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className={themeStyles.linkHover}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className={`${themeStyles.subtext} hover:${themeStyles.linkHover}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className={`p-2 border-t ${themeStyles.borderColor} text-center`}>
            <button
              onClick={() => setIsOpen(false)}
              className={`text-sm ${themeStyles.subtext} hover:${themeStyles.linkHover}`}
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