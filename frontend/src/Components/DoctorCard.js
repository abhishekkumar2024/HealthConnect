import React from 'react';
import { Star, Clock, MapPin, Heart, Calendar, DollarSign, IndianRupee } from 'lucide-react';
import { useDarkMode } from '../contextAPI/contextApi';
import { Link, useNavigate } from 'react-router-dom';

const DoctorCard = ({ doctor }) => {
  const { name, specialization, qualification, experience, consultationFee, licence, timeSlots, address, profileUrl, averageRating } = doctor;
  const { themeStyles } = useDarkMode();
  const [isLiked, setIsLiked] = React.useState(false);

  const BookingId = doctor._id;

  const navigate = useNavigate();

  return (
    <div 
      className={`w-80 h-[400px] rounded-2xl transition-all duration-300 hover:scale-105 ${themeStyles.cardBg} ${themeStyles.cardHoverBg} overflow-hidden group relative backdrop-blur-md bg-opacity-20 border border-white/10 flex flex-col`}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Image Section */}
      <div className="relative pt-4 px-4 pb-2">
        <div className="relative w-16 h-16 mx-auto">
          {/* Image Border/Background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1 animate-border-spin">
            <div className={`${themeStyles.cardBg} w-full h-full rounded-full p-1`}>
              {/* Profile Image */}
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <img 
                  src={profileUrl || "/api/placeholder/320/192"} 
                  alt={name}
                  className="w-full h-full object-cover rounded-full transform group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 z-20">
          <div className={`${themeStyles.accentBg} backdrop-blur-md bg-opacity-90 rounded-full px-2 py-1 flex items-center gap-1`}>
            <Star size={12} className="text-yellow-400" />
            <span className={`${themeStyles.accentText} font-semibold text-xs`}>{averageRating}</span>
          </div>
        </div>

        {/* Like Button */}
        <button 
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-2 left-2 z-20 p-1 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors duration-200"
        >
          <Heart 
            size={16} 
            className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-red-500'} transition-colors duration-200`}
          />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-2 flex-1 overflow-y-auto">
        {/* Doctor Info */}
        <div className="text-center">
          <h3 className={`${themeStyles.text} font-bold text-lg mb-1`}>{name}</h3>
          <p className={`${themeStyles.subtext} text-xs`}>{specialization}</p>
        </div>

        {/* Stats & Info */}
        <div className="grid grid-cols-2 gap-2">
          {/* Experience */}
          <div className={`${themeStyles.accentBg} rounded-lg p-1.5 flex items-center gap-2 backdrop-blur-md bg-opacity-50`}>
            <Clock size={14} className={themeStyles.iconColor} />
            <div>
              <span className={`${themeStyles.subtext} text-xs block`}>Experience</span>
              <span className={`${themeStyles.text} text-sm font-medium`}>{experience}</span>
            </div>
          </div>

          {/* Location */}
          <div className={`${themeStyles.accentBg} rounded-lg p-1.5 flex items-center gap-2 backdrop-blur-md bg-opacity-50`}>
            <MapPin size={14} className={themeStyles.iconColor} />
            <div>
              <span className={`${themeStyles.subtext} text-xs block`}>Location</span>
              <span className={`${themeStyles.text} text-sm font-medium break-words`}>
                {address}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fees and Appointment Section */}
      <div className="p-4">
        <div className={`${themeStyles.accentBg} rounded-lg p-2 backdrop-blur-md bg-opacity-50 flex items-center justify-between transition-all duration-200 hover:bg-opacity-60`}>
          <div className="flex items-center gap-2">
            <IndianRupee size={16} className={themeStyles.iconColor} />
            <div>
              <span className={`${themeStyles.subtext} text-xs block`}>Fees</span>
              <span className={`${themeStyles.text} text-sm font-medium`}>₹{consultationFee}</span>
            </div>
          </div>
          <button 
            className={`${themeStyles.buttonBg} ${themeStyles.buttonHoverBg} text-white py-1 px-3 rounded-md font-medium transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2`}
            onClick = {() => navigate(`/Booking/${BookingId}`)}
          >
            <Calendar size={14} />
            Book
          </button>
        </div>
      </div>
    </div>
  );
};

export { DoctorCard };