import React from 'react';
import { Star, Clock, Phone, Calendar, MapPin, Heart } from 'lucide-react';
import { useDarkMode } from '../contextAPI/contextApi';

const DoctorCard = ({
  doctorName = "Dr. Rahul Kumar",
  specialty = "Cardiologist",
  rating = 4.8,
  experience = "15+ years",
  location = "Mumbai Central",
  availability = "Next available: Today",
  imageUrl = "http://res.cloudinary.com/dqyu291ng/image/upload/v1736610920/pywxydkodxl2pvcnvv52.jpg"
}) => {
  const { themeStyles } = useDarkMode();
  const [isLiked, setIsLiked] = React.useState(false);

  return (
    <div 
      className={`w-96 rounded-2xl transition-all duration-300 hover:scale-102 ${themeStyles.cardBg} ${themeStyles.shadowEffect} overflow-hidden group`}
    >
      {/* Image Section with Overlay */}
      <div className="relative pt-8 px-8 pb-4">
        <div className="relative w-24 h-24 mx-auto">
          {/* Image Border/Background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1 animate-border-spin">
            <div className={`${themeStyles.cardBg} w-full h-full rounded-full p-2`}>
              {/* Profile Image */}
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <img 
                  src={imageUrl || "/api/placeholder/320/192"} 
                  alt={doctorName}
                  className="w-full h-full object-cover rounded-full transform group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-6 right-6 z-20">
          <div className={`${themeStyles.accentBg} backdrop-blur-md bg-opacity-90 rounded-full px-3 py-1 flex items-center gap-1`}>
            <Star size={16} className="text-yellow-400" />
            <span className={`${themeStyles.accentText} font-semibold`}>{rating}</span>
          </div>
        </div>

        {/* Like Button */}
        <button 
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-6 left-6 z-20 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors duration-200"
        >
          <Heart 
            size={20} 
            className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-white'} transition-colors duration-200`}
          />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Doctor Info */}
        <div className="text-center">
          <h3 className={`${themeStyles.text} font-bold text-xl mb-1`}>{doctorName}</h3>
          <p className={`${themeStyles.subtext} text-sm`}>{specialty}</p>
        </div>

        {/* Stats & Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`${themeStyles.accentBg} rounded-xl p-3 flex items-center gap-2`}>
            <Clock size={18} className={themeStyles.iconColor} />
            <div>
              <span className={`${themeStyles.subtext} text-xs block`}>Experience</span>
              <span className={`${themeStyles.text} text-sm font-medium`}>{experience}</span>
            </div>
          </div>
          <div className={`${themeStyles.accentBg} rounded-xl p-3 flex items-center gap-2`}>
            <MapPin size={18} className={themeStyles.iconColor} />
            <div>
              <span className={`${themeStyles.subtext} text-xs block`}>Location</span>
              <span className={`${themeStyles.text} text-sm font-medium truncate`}>{location}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2 pt-2">
          <button 
            className={`${themeStyles.buttonBg} ${themeStyles.buttonHoverBg} text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:shadow-lg`}
          >
            Book Appointment
          </button>
          <button 
            className={`border ${themeStyles.borderColor} ${themeStyles.text} py-3 px-4 rounded-xl font-medium hover:bg-opacity-10 transition-all duration-200`}
          >
            View Full Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export { DoctorCard };