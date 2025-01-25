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
            ? "bg-gradient-to-b from-blue-900 to-blue-950"
            : "bg-gradient-to-b from-gray-50 to-white",
        
        // Text colors
        text: isDarkMode ? "text-white" : "text-gray-900",
        subtext: isDarkMode ? "text-blue-200" : "text-gray-500",
        
        // Card styles
        cardBg: isDarkMode ? "bg-white/10" : "bg-blue-100",
        cardHoverBg: isDarkMode ? "bg-white/20" : "bg-gray-50",
        
        // Navigation
        navBg: isDarkMode ? "bg-white/10" : "bg-white",
        
        // Accent colors
        accentBg: isDarkMode ? "bg-blue-900/50" : "bg-blue-50",
        accentText: isDarkMode ? "text-blue-200" : "text-blue-600",
        
        // Buttons
        buttonBg: isDarkMode ? "bg-blue-600" : "bg-blue-600",
        buttonHoverBg: isDarkMode ? "hover:bg-blue-700" : "hover:bg-blue-400",
        
        // Borders
        borderColor: isDarkMode ? "border-blue-800" : "border-gray-200",
        
        // Form inputs
        inputBg: isDarkMode ? "bg-blue-900/50" : "bg-blue-50",
        inputText: isDarkMode ? "placeholder:text-blue-300" : "placeholder:text-gray-400",
        inputBorder: isDarkMode 
            ? "border-blue-800 focus:border-blue-400 focus:ring-blue-400" 
            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500",
        
        // Icons
        iconColor: isDarkMode ? "text-blue-400" : "text-blue-600",
        linkHover: isDarkMode ? "hover:text-blue-400" : "hover:text-blue-700",
        
        // Feature cards
        featureCard: isDarkMode ? "bg-white/10" : "bg-white shadow-md",
        featureIconBg: isDarkMode ? "bg-blue-900/30" : "bg-blue-50",
        featureText: isDarkMode ? "text-white" : "text-gray-800",
        featureSubtext: isDarkMode ? "text-blue-200" : "text-gray-600",
        
        // Footer
        footerBg: isDarkMode ? "bg-blue-950" : "bg-gray-50",
        
        // Modal
        modalBg: isDarkMode ? "bg-blue-900/90" : "bg-white",
        modalText: isDarkMode ? "text-white" : "text-gray-800",
        
        // Tooltip
        tooltipBg: isDarkMode ? "bg-blue-800" : "bg-gray-700",
        tooltipText: isDarkMode ? "text-blue-200" : "text-white",
        
        // Shadows
        shadowEffect: isDarkMode 
            ? "shadow-md shadow-blue-900/50" 
            : "shadow-md shadow-gray-200/50",
        
        // Highlights
        highlightBg: isDarkMode ? "bg-blue-700/50" : "bg-blue-50",
        highlightText: isDarkMode ? "text-yellow-300" : "text-blue-700",
        
        // Tables
        tableHeaderBg: isDarkMode ? "bg-blue-800" : "bg-gray-50",
        tableRowBg: isDarkMode ? "bg-blue-950/20" : "bg-white",
        tableRowHoverBg: isDarkMode ? "hover:bg-blue-900/30" : "hover:bg-gray-50",
        
        // Alerts
        alertBg: isDarkMode ? "bg-red-800/50" : "bg-red-50",
        alertText: isDarkMode ? "text-red-300" : "text-red-600",
        
        // Success states
        successBg: isDarkMode ? "bg-green-800/50" : "bg-green-50",
        successText: isDarkMode ? "text-green-300" : "text-green-600",
        
        // Warning states
        warningBg: isDarkMode ? "bg-yellow-800/50" : "bg-yellow-50",
        warningText: isDarkMode ? "text-yellow-300" : "text-yellow-600",
        
        // Info states
        infoBg: isDarkMode ? "bg-blue-800/50" : "bg-blue-50",
        infoText: isDarkMode ? "text-blue-300" : "text-blue-600",
    };

    return (
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, themeStyles }}>
            {children}
        </DarkModeContext.Provider>
    );
};

export { DarkModeProvider };