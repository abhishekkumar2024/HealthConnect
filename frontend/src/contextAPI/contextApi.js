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
        background: isDarkMode 
          ? "bg-gradient-to-b from-blue-900 to-blue-950"
          : "bg-gradient-to-b from-blue-50 to-white",
        text: isDarkMode ? "text-white" : "text-gray-900",
        subtext: isDarkMode ? "text-blue-200" : "text-gray-600",
        cardBg: isDarkMode ? "bg-white/10" : "bg-white",
        cardHoverBg: isDarkMode ? "bg-white/20" : "bg-gray-50",
        navBg: isDarkMode ? "bg-white/10" : "bg-white/80",
        accentBg: isDarkMode ? "bg-blue-900/50" : "bg-blue-50",
        accentText: isDarkMode ? "text-blue-200" : "text-blue-600",
        buttonBg: isDarkMode ? "bg-blue-600" : "bg-blue-500",
        buttonHoverBg: isDarkMode ? "hover:bg-blue-700" : "hover:bg-blue-600",
        borderColor: isDarkMode ? "border-blue-800" : "border-gray-200",
        inputBg: isDarkMode ? "bg-blue-900/50" : "bg-white",
        inputText: isDarkMode ? "placeholder:text-blue-300" : "placeholder:text-gray-400",
        inputBorder: isDarkMode ? "focus:ring-blue-400" : "focus:ring-blue-500",
        iconColor: isDarkMode ? "text-blue-400" : "text-blue-500",
        linkHover: isDarkMode ? "hover:text-blue-400" : "hover:text-blue-600",
        featureCard: isDarkMode ? "bg-white/10" : "bg-white shadow-lg",
        featureIconBg: isDarkMode ? "bg-blue-900/30" : "bg-blue-50",
        featureText: isDarkMode ? "text-white" : "text-gray-900",
        featureSubtext: isDarkMode ? "text-blue-200" : "text-gray-600",
        footerBg: isDarkMode ? "bg-blue-950" : "bg-gray-50",
        // Newly Added Fields
        modalBg: isDarkMode ? "bg-blue-900/90" : "bg-white",
        modalText: isDarkMode ? "text-white" : "text-gray-900",
        tooltipBg: isDarkMode ? "bg-blue-800" : "bg-gray-200",
        tooltipText: isDarkMode ? "text-blue-200" : "text-gray-800",
        shadowEffect: isDarkMode ? "shadow-md shadow-blue-900/50" : "shadow-lg shadow-gray-200/50",
        highlightBg: isDarkMode ? "bg-blue-700/50" : "bg-yellow-100",
        highlightText: isDarkMode ? "text-yellow-300" : "text-yellow-800",
        tableHeaderBg: isDarkMode ? "bg-blue-800" : "bg-gray-100",
        tableRowBg: isDarkMode ? "bg-blue-950/20" : "bg-gray-50",
        alertBg: isDarkMode ? "bg-red-800/50" : "bg-red-100",
        alertText: isDarkMode ? "text-red-300" : "text-red-800",
    };

    return (
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, themeStyles }}>
            {children}
        </DarkModeContext.Provider>
    );
};

export { DarkModeProvider };
