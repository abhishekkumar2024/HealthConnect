import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Star, 
  MapPin, 
  Clock, 
  Award, 
  Calendar,
  GraduationCap,
  User,
  CheckCircle
} from 'lucide-react';
import { format, addDays, isAfter, startOfDay } from 'date-fns';
import toast from 'react-hot-toast';

const DoctorCard = ({ doctor }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleBookAppointment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to book an appointment');
      navigate('/login');
      return;
    }
    if (user?.role !== 'patient') {
      toast.error('Only patients can book appointments');
      return;
    }
    navigate(`/booking/${doctor._id}`);
  };

  // Calculate next available dates based on time slots
  const getAvailableDates = () => {
    // If availability is explicitly false, return empty
    if (doctor.availability === false) {
      return [];
    }

    if (!doctor.timeSlots || !Array.isArray(doctor.timeSlots) || doctor.timeSlots.length === 0) {
      return [];
    }

    // Filter available slots (check both isAvailable !== false and isAvailable === true)
    const availableSlots = doctor.timeSlots.filter(slot => 
      slot.isAvailable !== false && slot.isAvailable !== undefined
    );
    
    if (availableSlots.length === 0) {
      return [];
    }

    const dayMap = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };

    // Group slots by day
    const slotsByDay = {};
    availableSlots.forEach(slot => {
      if (slot.day) {
        const dayLower = slot.day.toLowerCase();
        if (!slotsByDay[dayLower]) {
          slotsByDay[dayLower] = [];
        }
        slotsByDay[dayLower].push(slot);
      }
    });

    const availableDays = Object.keys(slotsByDay).map(day => dayMap[day.toLowerCase()]).filter(day => day !== undefined);
    if (availableDays.length === 0) {
      return [];
    }

    const today = startOfDay(new Date());
    const nextDates = [];
    let currentDate = today;
    let daysChecked = 0;
    const maxDaysToCheck = 14;

    // Find next 3 available dates with their time slots
    while (nextDates.length < 3 && daysChecked < maxDaysToCheck) {
      const dayOfWeek = currentDate.getDay();
      const dayName = Object.keys(dayMap).find(key => dayMap[key] === dayOfWeek);
      
      if (dayName && slotsByDay[dayName]) {
        nextDates.push({
          date: new Date(currentDate),
          dayName: dayName,
          slots: slotsByDay[dayName]
        });
      }
      currentDate = addDays(currentDate, 1);
      daysChecked++;
    }

    return nextDates;
  };

  const availableDates = getAvailableDates();

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center space-x-0.5">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />;
          } else if (i === fullStars && hasHalfStar) {
            return (
              <div key={i} className="relative w-4 h-4">
                <Star className="w-4 h-4 text-gray-300 absolute" />
                <div className="absolute overflow-hidden" style={{ width: '50%' }}>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
              </div>
            );
          } else {
            return <Star key={i} className="w-4 h-4 text-gray-300" />;
          }
        })}
      </div>
    );
  };

  return (
    <div className="card hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary-300 group">
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="flex items-start space-x-4 mb-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              {doctor.userId?.profilePicture ? (
                <img
                  src={doctor.userId.profilePicture}
                  alt={doctor.userId?.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-2xl">
                  {doctor.userId?.name?.charAt(0) || 'D'}
                </span>
              )}
            </div>
            {doctor.isVerifiedDoctor && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Name and Specialization */}
          <div className="flex-1 min-w-0">
            <Link to={`/doctors/${doctor._id}`} className="block group-hover:text-primary-600 transition-colors">
              <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-primary-600">
                {doctor.userId?.name || 'Dr. Unknown'}
              </h3>
            </Link>
            <div className="flex items-center space-x-2 mt-1">
              <Award className="w-4 h-4 text-primary-600 flex-shrink-0" />
              <p className="text-sm font-medium text-gray-700 truncate">
                {doctor.specialization || 'General Practitioner'}
              </p>
            </div>
          </div>
        </div>

        {/* Rating and Reviews */}
        {doctor.averageRating > 0 && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {renderStars(doctor.averageRating)}
                <span className="text-sm font-semibold text-gray-900 ml-1">
                  {doctor.averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                ({doctor.totalReviews || 0} {doctor.totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>
        )}

        {/* Details Section */}
        <div className="space-y-3 mb-4 flex-1">
          {/* Experience */}
          {doctor.experience && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-primary-600 flex-shrink-0" />
              <span>{doctor.experience} {doctor.experience === 1 ? 'year' : 'years'} of experience</span>
            </div>
          )}

          {/* Education */}
          {doctor.education && doctor.education.length > 0 && (
            <div className="flex items-start space-x-2 text-sm text-gray-600">
              <GraduationCap className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="line-clamp-2">
                  {doctor.education[0]?.degree}
                  {doctor.education[0]?.institution && ` - ${doctor.education[0].institution}`}
                </p>
              </div>
            </div>
          )}

          {/* Location */}
          {doctor.clinicAddress?.city && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0" />
              <span className="truncate">
                {doctor.clinicAddress.city}
                {doctor.clinicAddress.state && `, ${doctor.clinicAddress.state}`}
              </span>
            </div>
          )}

          {/* Languages */}
          {doctor.languages && doctor.languages.length > 0 && (
            <div className="flex items-start space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="line-clamp-1">
                  Speaks: {doctor.languages.slice(0, 3).join(', ')}
                  {doctor.languages.length > 3 && ` +${doctor.languages.length - 3} more`}
                </p>
              </div>
            </div>
          )}

          {/* Availability Status */}
          {(() => {
            // Check if doctor has availability explicitly set to false
            if (doctor.availability === false) {
              return (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium text-gray-700">Not Available</span>
                </div>
              );
            }

            // Check if we have available dates calculated
            if (availableDates.length > 0) {
              return (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">Available Dates:</span>
                  </div>
                  <div className="space-y-2">
                    {availableDates.slice(0, 3).map((item, index) => {
                      const isToday = format(item.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                      const isTomorrow = format(item.date, 'yyyy-MM-dd') === format(addDays(new Date(), 1), 'yyyy-MM-dd');
                      
                      let dateLabel = format(item.date, 'MMM dd');
                      if (isToday) dateLabel = 'Today';
                      else if (isTomorrow) dateLabel = 'Tomorrow';
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-2 bg-primary-50 rounded-md">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-xs font-semibold text-primary-700 capitalize">
                              {dateLabel}
                            </span>
                            {item.slots && item.slots.length > 0 && (
                              <span className="text-xs text-gray-600">
                                ({item.slots[0].startTime} - {item.slots[0].endTime})
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {availableDates.length > 3 && (
                      <div className="text-xs text-gray-500 text-center pt-1">
                        +{availableDates.length - 3} more dates available
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // Check if doctor has time slots configured
            if (doctor.timeSlots && Array.isArray(doctor.timeSlots) && doctor.timeSlots.length > 0) {
              const availableSlots = doctor.timeSlots.filter(slot => slot.isAvailable !== false);
              
              if (availableSlots.length > 0) {
                return (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-primary-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">Weekly Schedule:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {availableSlots
                        .slice(0, 4)
                        .map((slot, index) => (
                          <div
                            key={index}
                            className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium capitalize"
                          >
                            {slot.day ? slot.day.substring(0, 3) : 'N/A'}
                          </div>
                        ))}
                      {availableSlots.length > 4 && (
                        <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{availableSlots.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            }

            // Default: Show as available if no explicit unavailability
            return (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium text-gray-700">Availability: Check with doctor</span>
              </div>
            );
          })()}
        </div>

          {/* Bio Preview */}
        {doctor.bio && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <p className="text-sm text-gray-600 line-clamp-2">
              {doctor.bio}
            </p>
          </div>
        )}

        {/* Footer with Price and Booking */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              {doctor.consultationFee ? (
                <>
                  <p className="text-xs text-gray-500">Consultation Fee</p>
                  <p className="text-2xl font-bold text-primary-600">
                    ₹{doctor.consultationFee}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">Fee on request</p>
              )}
            </div>
            {doctor.totalAppointments > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Appointments</p>
                <p className="text-sm font-semibold text-gray-700">
                  {doctor.totalAppointments}+
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link
              to={`/doctors/${doctor._id}`}
              className="flex-1 btn-secondary text-center text-sm py-2"
              onClick={(e) => e.stopPropagation()}
            >
              View Profile
            </Link>
            <button
              onClick={handleBookAppointment}
              disabled={doctor.availability === false}
              className="flex-1 btn-primary text-sm py-2 flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;

