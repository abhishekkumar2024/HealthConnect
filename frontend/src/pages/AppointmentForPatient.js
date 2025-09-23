import React from 'react';
import { Calendar, Clock, MapPin, User, ChevronRight } from 'lucide-react';

const AppointmentsPageforPatient = () => {
  // Sample appointment data
  const appointments = [
    {
      id: 1,
      title: "Doctor's Appointment",
      date: "March 15, 2025",
      time: "10:30 AM",
      location: "Memorial Hospital, Suite 302",
      doctor: "Dr. Sarah Johnson",
      color: "bg-gradient-to-r from-purple-500 to-indigo-600"
    },
    {
      id: 2,
      title: "Dental Checkup",
      date: "March 22, 2025",
      time: "2:15 PM",
      location: "Bright Smile Dental Clinic",
      doctor: "Dr. Michael Chen",
      color: "bg-gradient-to-r from-blue-400 to-cyan-500"
    }
  ];

  return (
    <div className="w-full bg-gray-50 p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Appointments</h2>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {appointments.length} Upcoming
        </span>
      </div>

      {/* Landscape-oriented appointment cards */}
      <div className="space-y-4">
        {appointments.map(appointment => (
          <div 
            key={appointment.id} 
            className="flex bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
          >
            {/* Colored sidebar */}
            <div className={`${appointment.color} w-3`}></div>
            
            {/* Date column */}
            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 min-w-24 text-center">
              <p className="text-xl font-bold text-gray-900">{appointment.date.split(',')[0].split(' ')[1]}</p>
              <p className="text-sm font-medium text-gray-600">{appointment.date.split(',')[0].split(' ')[0]}</p>
              <div className="mt-2 h-16 w-16 rounded-full bg-white flex items-center justify-center border-2 border-indigo-100 shadow-sm">
                <Clock className="w-8 h-8 text-indigo-500" />
              </div>
              <p className="mt-2 font-medium text-indigo-600">{appointment.time}</p>
            </div>
            
            {/* Main content */}
            <div className="flex-1 p-4 flex items-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{appointment.title}</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                    <span>{appointment.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2 text-indigo-500" />
                    <span>{appointment.doctor}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 ml-4">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center">
                  Details <ChevronRight className="w-4 h-4 ml-1" />
                </button>
                <button className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors">
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { AppointmentsPageforPatient }