import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, Calendar, LogOut, HelpCircle } from 'lucide-react';
import { logoutAPI } from "../api/auth.api";
import { useNavigate } from 'react-router-dom';
import { PatientDashboardAPI } from "../api/auth.api";
import { UserProfile } from '../api/auth.api.js';

const UserProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const logoutEventHandler = async(e)=>{
    e.preventDefault();

    try {
        // console.log("xyz")
        const response = await logoutAPI();

        if (response.status === 200) {
            alert("Logout successful");
            navigate("/login");
        } else {
            alert(response.data.message);
        }
    } catch (error) {
        alert(error.response?.data?.message || "Logout failed");
    }
  }

  const profileHandle = async(e)=>{
    e.preventDefault();
    try {

      const response = await UserProfile();
      // console.log(response)

      if (response.status === 200) {
        alert("Profile");
        navigate(`/profile/${response.data._id}`);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      
    }
  }
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
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
          onClick={ profileHandle }
          >
            <User className="h-4 w-4" />
            Profile
          </button>

          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </button>

          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Appointments
          </button>

          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Help
          </button>

          <div className="border-t border-gray-200">
            <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
            onClick={ logoutEventHandler }>
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export  { UserProfileMenu };