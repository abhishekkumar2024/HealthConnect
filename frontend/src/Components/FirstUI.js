import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Heart,
    Users,
    Calendar,
    ArrowRight,
    Headphones,
    Mail,
    Phone,
    MapPin,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Sun,
    Moon
} from 'lucide-react';
import { useDarkMode } from '../contextAPI/contextApi';

const LandingPage = () => {
    const { isDarkMode, toggleDarkMode, themeStyles } = useDarkMode();
    const [searchQuery, setSearchQuery] = useState('');

    // Base styles that change with theme

    return (
        <div className={`min-h-screen ${themeStyles.background} transition-colors duration-300`}>
            {/* Navigation */}
            <nav className={`relative z-10 backdrop-blur-sm ${themeStyles.navBg}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <Heart className={`h-8 w-8 ${themeStyles.iconColor}`} />
                            <span className={`ml-2 text-2xl font-bold ${themeStyles.text}`}>HealthConnect</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Theme Toggle Button */}
                            <button
                                onClick={toggleDarkMode}
                                className={`p-2 rounded-lg ${themeStyles.cardBg} ${themeStyles.text}`}
                                aria-label="Toggle theme"
                            >
                                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                            <Link
                                to="/login"
                                className={`px-4 py-2 rounded-lg ${themeStyles.text} ${themeStyles.linkHover} transition-colors`}
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className={`px-4 py-2 rounded-lg ${themeStyles.buttonBg} ${themeStyles.buttonHoverBg} text-white transition-colors`}
                            >
                                Register
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Content */}
            <div className="relative pt-16 pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left">
                            <h1 className={`text-4xl md:text-5xl font-bold ${themeStyles.text} mb-6`}>
                                Your Health Journey Starts Here
                            </h1>
                            <p className={`text-xl ${themeStyles.subtext} mb-8`}>
                                Connect with top healthcare professionals and manage your health records seamlessly.
                            </p>
                            {/* Rest of the hero content with updated theme classes */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                                >
                                    Get Started
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <button className="inline-flex items-center px-6 py-3 rounded-lg border border-blue-400 text-blue-400 hover:bg-blue-400/10 font-semibold transition-colors">
                                    Learn More
                                </button>
                            </div>
                        </div>
                        {/* Feature cards section with updated theme classes */}
                        <div className="relative">
                            <div className={`aspect-w-5 aspect-h-4 rounded-2xl overflow-hidden ${isDarkMode ? 'bg-blue-800/30' : 'bg-blue-50'} backdrop-blur-sm p-8`}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div className={`${themeStyles.featureCard} p-4 rounded-lg transition-colors duration-300`}>
                                            <Users className={`h-8 w-8 ${themeStyles.iconColor} mb-2`} />
                                            <h3 className={`text-lg font-semibold ${themeStyles.featureText}`}>Expert Doctors</h3>
                                            <p className={`${themeStyles.featureSubtext} text-sm`}>Access to qualified healthcare professionals</p>
                                        </div>
                                        <div className={`${themeStyles.featureCard} p-4 rounded-lg transition-colors duration-300`}>
                                            <Calendar className={`h-8 w-8 ${themeStyles.iconColor} mb-2`} />
                                            <h3 className={`text-lg font-semibold ${themeStyles.featureText}`}>Easy Scheduling</h3>
                                            <p className={`${themeStyles.featureSubtext} text-sm`}>Book appointments at your convenience</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4 mt-8">
                                        <div className={`${themeStyles.featureCard} p-4 rounded-lg transition-colors duration-300`}>
                                            <Heart className={`h-8 w-8 ${themeStyles.iconColor} mb-2`} />
                                            <h3 className={`text-lg font-semibold ${themeStyles.featureText}`}>Health Records</h3>
                                            <p className={`${themeStyles.featureSubtext} text-sm`}>Secure digital health management</p>
                                        </div>
                                        <div className={`${themeStyles.featureCard} p-4 rounded-lg transition-colors duration-300`}>
                                            <Headphones className={`h-8 w-8 ${themeStyles.iconColor} mb-2`} />
                                            <h3 className={`text-lg font-semibold ${themeStyles.featureText}`}>24/7 Support</h3>
                                            <p className={`${themeStyles.featureSubtext} text-sm`}>Round-the-clock assistance</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer with updated theme classes */}
            <footer className={`${themeStyles.footerBg} border-t ${themeStyles.borderColor} transition-colors duration-300`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <Heart className={`h-6 w-6 ${themeStyles.iconColor}`} />
                                <span className={`ml-2 text-xl font-bold ${themeStyles.text}`}>HealthConnect</span>
                            </div>
                            <p className={themeStyles.subtext}>
                                Revolutionizing healthcare access and management through technology.
                            </p>
                        </div>
                        <div>
                            <h3 className={`text-lg font-semibold ${themeStyles.text} mb-4`}>Quick Links</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/about" className={`${themeStyles.subtext} ${themeStyles.linkHover} transition-colors`}>
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/services" className={`${themeStyles.subtext} ${themeStyles.linkHover} transition-colors`}>
                                        Our Services
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/doctors" className={`${themeStyles.subtext} ${themeStyles.linkHover} transition-colors`}>
                                        Find Doctors
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/contact" className={`${themeStyles.subtext} ${themeStyles.linkHover} transition-colors`}>
                                        Contact Us
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className={`text-lg font-semibold ${themeStyles.text} mb-4`}>Contact Info</h3>
                            <ul className="space-y-2">
                                <li className={`flex items-center ${themeStyles.subtext}`}>
                                    <Phone className="h-5 w-5 mr-2" />
                                    +1 234 567 890
                                </li>
                                <li className={`flex items-center ${themeStyles.subtext}`}>
                                    <Mail className="h-5 w-5 mr-2" />
                                    info@healthconnect.com
                                </li>
                                <li className={`flex items-center ${themeStyles.subtext}`}>
                                    <MapPin className="h-5 w-5 mr-2" />
                                    123 Health Street, Medical City
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className={`text-lg font-semibold ${themeStyles.text} mb-4`}>Follow Us</h3>
                            <div className="flex space-x-4">
                                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                                    <a
                                        key={index}
                                        href="#"
                                        className={`${themeStyles.subtext} ${themeStyles.linkHover} transition-colors`}
                                    >
                                        <Icon className="h-6 w-6" />
                                    </a>
                                ))}
                            </div>
                            <div className="mt-6">
                                <h4 className={`${themeStyles.text} font-semibold mb-2`}>Newsletter</h4>
                                <div className="flex">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className={`flex-1 px-4 py-2 rounded-l-lg ${themeStyles.inputBg} ${themeStyles.text} 
                    ${themeStyles.inputText} focus:outline-none focus:ring-2 ${themeStyles.inputBorder} transition-colors duration-300`}
                                    />
                                    <button className={`px-4 py-2 ${themeStyles.buttonBg} ${themeStyles.buttonHoverBg} 
                    text-white rounded-r-lg transition-colors`}>
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`mt-12 pt-8 border-t ${themeStyles.borderColor} text-center ${themeStyles.subtext}`}>
                        <p>&copy; 2024 HealthConnect. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export { LandingPage };


