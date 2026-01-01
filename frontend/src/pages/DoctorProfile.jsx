import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doctorService } from '../services/doctor.service.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Star, Clock, Calendar, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorProfile = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  const fetchDoctor = async () => {
    try {
      const response = await doctorService.getDoctors();
      const foundDoctor = response.data?.find((d) => d._id === id);
      setDoctor(foundDoctor);
    } catch (error) {
      toast.error('Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book an appointment');
      navigate('/login');
      return;
    }
    if (user?.role !== 'patient') {
      toast.error('Only patients can book appointments');
      return;
    }
    navigate(`/booking/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-500 text-lg">Doctor not found</p>
        <Link to="/doctors" className="text-primary-600 hover:underline mt-4 inline-block">
          Browse all doctors
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Doctor Info Card */}
          <div className="card">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 font-bold text-3xl">
                  {doctor.userId?.name?.charAt(0) || 'D'}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {doctor.userId?.name || 'Dr. Unknown'}
                </h1>
                <p className="text-xl text-gray-600 mb-4">{doctor.specialization}</p>
                
                {doctor.averageRating > 0 && (
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(doctor.averageRating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-medium">
                      {doctor.averageRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500">({doctor.totalReviews} reviews)</span>
                  </div>
                )}

                {doctor.consultationFee && (
                  <p className="text-2xl font-bold text-primary-600">
                    ₹{doctor.consultationFee} per consultation
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {doctor.bio && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
            </div>
          )}

          {/* Education */}
          {doctor.education && doctor.education.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <GraduationCap className="w-6 h-6 text-primary-600" />
                <span>Education</span>
              </h2>
              <div className="space-y-3">
                {doctor.education.map((edu, index) => (
                  <div key={index} className="border-l-4 border-primary-500 pl-4">
                    <p className="font-semibold">{edu.degree}</p>
                    <p className="text-gray-600">{edu.institution}</p>
                    {edu.year && <p className="text-sm text-gray-500">{edu.year}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {doctor.timeSlots && doctor.timeSlots.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <Clock className="w-6 h-6 text-primary-600" />
                <span>Availability</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {doctor.timeSlots
                  .filter((slot) => slot.isAvailable)
                  .map((slot, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium capitalize">{slot.day}</p>
                      <p className="text-sm text-gray-600">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <div className="space-y-4">
              {doctor.consultationFee && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Consultation Fee</p>
                  <p className="text-3xl font-bold text-primary-600">
                    ₹{doctor.consultationFee}
                  </p>
                </div>
              )}

              {doctor.experience && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Experience</p>
                  <p className="text-lg font-semibold">{doctor.experience} years</p>
                </div>
              )}

              {doctor.licenseNumber && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">License</p>
                  <p className="text-lg font-semibold">{doctor.licenseNumber}</p>
                </div>
              )}

              {isAuthenticated && user?.role === 'patient' && (
                <button
                  onClick={handleBookAppointment}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Appointment</span>
                </button>
              )}

              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Login to Book</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;

