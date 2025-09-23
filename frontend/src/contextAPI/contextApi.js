import React, { createContext, useState, useContext } from 'react';

// Create Context
const DarkModeContext = createContext();

// Custom Hook for easy access
export const useDarkMode = () => useContext(DarkModeContext);

// Provider Component
const DarkModeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setIsDarkMode((prevMode) => !prevMode);
    };

    const themeStyles = {
        // Main backgrounds
        background: isDarkMode 
          ? "bg-gradient-to-b from-gray-900 to-gray-950" // Dark gradient
          : "bg-gradient-to-b from-gray-50 to-white", // Light gradient
      
        // Text colors
        text: isDarkMode ? "text-white" : "text-gray-900", // Primary text
        subtext: isDarkMode ? "text-gray-400" : "text-gray-600", // Secondary text
      
        // Card styles
        cardBg: isDarkMode ? "bg-gray-800" : "bg-purple-400", // Card background
        cardHoverBg: isDarkMode ? "bg-gray-700" : "bg-gray-200", // Card hover background

        // Navigation
        navBg: isDarkMode ? "bg-gray-800/90" : "bg-white/90", // Semi-transparent nav
        navText: isDarkMode ? "text-white" : "text-gray-900", // Nav text
      
        // Accent colors (Purple and Teal)
        accentBg: isDarkMode ? "bg-purple-800/50" : "bg-blue-100", // Accent background
        accentText: isDarkMode ? "text-purple-300" : "text-teal-600", // Accent text
      
        // Buttons
        buttonBg: isDarkMode ? "bg-purple-600" : "bg-teal-500", // Button background
        buttonHoverBg: isDarkMode ? "hover:bg-purple-700" : "hover:bg-teal-400", // Button hover
      
        // Borders
        borderColor: isDarkMode ? "border-gray-700" : "border-gray-200", // Borders
      
        // Form inputs
        inputBg: isDarkMode ? "bg-gray-700/50" : "bg-gray-50", // Input background
        inputText: isDarkMode ? "text-white" : "text-gray-900", // Input text
        inputBorder: isDarkMode 
          ? "border-gray-600 focus:border-purple-400 focus:ring-purple-400" 
          : "border-gray-200 focus:border-teal-500 focus:ring-teal-500", // Input border
      
        // Icons
        iconColor: isDarkMode ? "text-purple-400" : "text-teal-500", // Icons
        linkHover: isDarkMode ? "hover:text-purple-400" : "hover:text-teal-600", // Link hover
        iconHoverBg: isDarkMode ? "hover:bg-blue-700" : "hover:bg-gray-700", // Icon hover background
        
        // Feature cards
        featureCard: isDarkMode ? "bg-gray-800" : "bg-white shadow-md", // Feature card
        featureIconBg: isDarkMode ? "bg-purple-800/30" : "bg-teal-50", // Feature icon background
        featureText: isDarkMode ? "text-white" : "text-gray-800", // Feature text
        featureSubtext: isDarkMode ? "text-gray-400" : "text-gray-600", // Feature subtext
      
        // Footer
        footerBg: isDarkMode ? "bg-gray-900" : "bg-gray-50", // Footer background
        footerText: isDarkMode ? "text-gray-400" : "text-gray-600", // Footer text
      
        // Modal
        modalBg: isDarkMode ? "bg-gray-800" : "bg-white", // Modal background
        modalText: isDarkMode ? "text-white" : "text-gray-900", // Modal text
      
        // Tooltip
        tooltipBg: isDarkMode ? "bg-gray-700" : "bg-gray-800", // Tooltip background
        tooltipText: isDarkMode ? "text-white" : "text-gray-100", // Tooltip text
      
        // Shadows
        shadowEffect: isDarkMode 
          ? "shadow-md shadow-gray-800/50" 
          : "shadow-md shadow-gray-200/50", // Shadows
      
        // Highlights
        highlightBg: isDarkMode ? "bg-purple-800/50" : "bg-teal-50", // Highlight background
        highlightText: isDarkMode ? "text-purple-300" : "text-teal-600", // Highlight text
      
        // Tables
        tableHeaderBg: isDarkMode ? "bg-gray-700" : "bg-gray-100", // Table header
        tableRowBg: isDarkMode ? "bg-gray-800/20" : "bg-white", // Table row
        tableRowHoverBg: isDarkMode ? "hover:bg-gray-700/30" : "hover:bg-gray-50", // Row hover
      
        // Alerts
        alertBg: isDarkMode ? "bg-red-800/50" : "bg-red-50", // Alert background
        alertText: isDarkMode ? "text-red-300" : "text-red-600", // Alert text
      
        // Success states
        successBg: isDarkMode ? "bg-green-800/50" : "bg-green-50", // Success background
        successText: isDarkMode ? "text-green-300" : "text-green-600", // Success text
      
        // Warning states
        warningBg: isDarkMode ? "bg-yellow-800/50" : "bg-yellow-50", // Warning background
        warningText: isDarkMode ? "text-yellow-300" : "text-yellow-600", // Warning text
      
        // Info states
        infoBg: isDarkMode ? "bg-blue-800/50" : "bg-blue-50", // Info background
        infoText: isDarkMode ? "text-blue-300" : "text-blue-600", // Info text
      
        // Tabs
        selectedTabBg: isDarkMode ? "bg-purple-600" : "bg-teal-500", // Selected tab
        otherTabBg: isDarkMode ? "bg-gray-700" : "bg-gray-200", // Other tabs
      
        // Placeholder
        placeHoldertext: isDarkMode ? "text-gray-400" : "text-gray-500", // Placeholder text
        searchBarborderColor: isDarkMode ? "border-gray-600" : "border-gray-300", // Search bar border
      
        // Spans
        spanbg: isDarkMode ? "bg-purple-600" : "bg-teal-500", // Span background
        spantext: isDarkMode ? "text-white" : "text-gray-100", // Span text
      };

    return (
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, themeStyles }}>
            {children}
        </DarkModeContext.Provider>
    );
};

export { DarkModeProvider };