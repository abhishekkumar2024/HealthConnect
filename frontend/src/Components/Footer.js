import { useDarkMode } from "../contextAPI/contextApi"
import { Link } from 'react-router-dom'
import { Heart, Users, Calendar, ArrowRight, Headphones, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Sun, Moon } from 'lucide-react';

const Footer = () => {

    const { themeStyles } = useDarkMode()

    return (
        <>
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
        </>
    )
}

export { Footer }