import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, Calendar, LogOut, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IsverifyJWTAPI, logoutAPI } from '../api/auth.api.js';
import { useDarkMode } from '../contextAPI/contextApi.js';

const UserProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { themeStyles } = useDarkMode()
  const navigate = useNavigate();

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

  const logoutEventHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await logoutAPI();
      if (response.status === 200) {
        navigate("/login");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Logout failed");
    }
  }

  const profileHandler = async (e) => {
    e.preventDefault();
    const Response = await IsverifyJWTAPI();
    // console.log(Response.data.data.user.role)
    if (Response.data.data.user.role === 'patient') {
      navigate(`/patient-profile/${Response.data.data.user._id}`);
    }
    else if (Response.data.data.user.role === 'doctor') {
      // console.log(Response.data._id)
      navigate(`/doctor-profile/${Response.data.data.user._id}`);
    }
  }

  const appointmentHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await IsverifyJWTAPI();
      // console.log(response)

      if (response.status === 200) {
        // alert("Appointments");
        navigate(`/appointments/${response.data._id}`);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Profile failed");
    }
  }
  const settingHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await IsverifyJWTAPI();
      // console.log(response)

      if (response.status === 200) {
        // alert("Settings");
        navigate(`/setting/${response.data._id}`);
      } else {
        navigate('/login')
        alert(response.data.message);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Profile failed");
    }


  }
  const helpHandler = async (e) => {
    e.preventDefault();
    try {
      navigate('/help')
    } catch (error) {
      navigate('/login')
      alert(error.response?.data?.message || "Profile failed");
    }
  }
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full ${themeStyles.buttonHoverBg} text-gray-700`}
      >
        <User className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          {/* User Info */}
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700">John Doe</p>
            <p className="text-xs text-gray-500">john@example.com</p>
          </div>

          {/* Menu Items */}
          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            onClick={profileHandler}
          >
            <User className="h-4 w-4" />
            Profile
          </button>

          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            onClick={settingHandler}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>

          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            onClick={appointmentHandler}
          >
            <Calendar className="h-4 w-4" />
            Appointments
          </button>

          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            onClick={helpHandler}
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </button>

          <div className="border-t border-gray-200">
            <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
              onClick={logoutEventHandler}>
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { UserProfileMenu };