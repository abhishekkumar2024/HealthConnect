import React, { useState, useEffect} from 'react';
import { Calendar, Clock, Plus, User, MessageSquare, Phone, Check, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "../utilities/cards/Card";
import { useDarkMode } from "../contextAPI/contextApi";
import { fetchallAppointments } from "../api/appointment.api";

const AppointmentsPageforDoctor = () => {
  const { themeStyles } = useDarkMode();
  // Add a new time slot
  const [newSlotTime, setNewSlotTime] = useState("");
  
  // Sample appointments data
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      doctor: "Dr. Sarah Johnson",
      specialty: "Primary Care",
      date: "March 15, 2025",
      time: "10:30 AM",
      status: "upcoming",
      patientName: "Emma Wilson",
      reason: "Annual physical exam"
    },
    {
      id: 2,
      title: "Dental Checkup",
      doctor: "Dr. Michael Chen",
      specialty: "Dentistry",
      date: "March 22, 2025",
      time: "2:15 PM",
      status: "upcoming",
      patientName: "James Martinez",
      reason: "Regular checkup and cleaning"
    }
  ]);

  // Sample pending appointments
  const [pendingAppointments, setPendingAppointments] = useState([
    {
      id: 101,
      patientName: "Robert Davis",
      title: "Follow-up Consultation",
      doctor: "Dr. Sarah Johnson",
      specialty: "Primary Care",
      requestedDate: "March 16, 2025",
      requestedTime: "11:30 AM",
      reason: "Follow-up on test results",
      status: "pending"
    },
    {
      id: 102,
      patientName: "Maria Garcia",
      title: "New Patient Visit",
      doctor: "Dr. Sarah Johnson",
      specialty: "Primary Care",
      requestedDate: "March 17, 2025",
      requestedTime: "9:00 AM",
      reason: "Initial consultation",
      status: "pending"
    }
  ]);

  // Sample available time slots
  const [availableSlots, setAvailableSlots] = useState([
    { id: 1, time: "9:00 AM", available: true },
    { id: 2, time: "10:00 AM", available: true },
    { id: 3, time: "11:00 AM", available: true },
    { id: 4, time: "1:00 PM", available: false },
    { id: 5, time: "2:00 PM", available: true },
    { id: 6, time: "3:00 PM", available: true },
    { id: 7, time: "4:00 PM", available: false },
    { id: 8, time: "5:00 PM", available: true }
  ]);

  // Toggle time slot availability
  const toggleTimeSlot = (id) => {
    setAvailableSlots(availableSlots.map(slot => 
      slot.id === id ? { ...slot, available: !slot.available } : slot
    ));
  };

  // Handle appointment confirmation
  const confirmAppointment = (id) => {
    const appointmentToConfirm = pendingAppointments.find(apt => apt.id === id);
    
    // Update pending appointments list
    setPendingAppointments(pendingAppointments.map(appt => 
      appt.id === id ? { ...appt, status: "confirmed" } : appt
    ));
    
    // Add to confirmed appointments
    if (appointmentToConfirm) {
      setAppointments([...appointments, {
        ...appointmentToConfirm,
        status: "upcoming",
        date: appointmentToConfirm.requestedDate,
        time: appointmentToConfirm.requestedTime
      }]);
    }
  };

  // Handle appointment rejection
  const rejectAppointment = (id) => {
    setPendingAppointments(pendingAppointments.map(appt => 
      appt.id === id ? { ...appt, status: "rejected" } : appt
    ));
  };

  const addNewTimeSlot = () => {
    if (newSlotTime) {
      const newId = Math.max(...availableSlots.map(slot => slot.id)) + 1;
      setAvailableSlots([...availableSlots, { id: newId, time: newSlotTime, available: true }]);
      setNewSlotTime("");
    }
  };

  // Calculate stats
  const stats = {
    total: appointments.length + pendingAppointments.length,
    upcoming: appointments.filter(apt => apt.status === "upcoming").length,
    completed: appointments.filter(apt => apt.status === "completed").length,
    cancelled: appointments.filter(apt => apt.status === "cancelled").length,
    pending: pendingAppointments.filter(apt => apt.status === "pending").length
  };

  // Format for display date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // fetch all appointments
  const FetchAppointments = async () => {
    try {
      const appointments = await fetchallAppointments();
      setAppointments(appointments.map((appointment) =>{
        return {
          id: appointment._id,
          title: "Best Doctor",
          doctor: appointment.doctor,
          specialty: appointment.specialty,
          date: appointment.date,
          time: appointment.time,
          status: appointment.status,
          patientName: appointment.patientName,
          reason: appointment.reason
        }
      }));
    } catch (error) {
      
    }
  }

  useEffect(() => {
    FetchAppointments();
  }, []);

  return (
    <div className={`p-6 max-w-6xl mx-auto space-y-6 ${themeStyles.bg} ${themeStyles.text}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white rounded-xl shadow-lg`}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Healthcare Dashboard</h2>
            <p className="text-blue-100">Appointment Management System</p>
          </div>
          <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left column - Appointment display */}
        <div className="space-y-6">
          <Card className={`${themeStyles.cardBg} ${themeStyles.border} border`}>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className={`${themeStyles.accentBg} p-4 rounded-lg space-y-2 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{apt.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          apt.status === "upcoming"
                            ? "bg-green-100 text-green-800"
                            : apt.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                    <div className="text-sm">
                      <p className="flex items-center gap-2">
                        <User size={16} /> {apt.doctor} - {apt.specialty}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar size={16} /> {apt.date}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock size={16} /> {apt.time}
                      </p>
                    </div>
                    <div className="flex gap-4 mt-2">
                      <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${themeStyles.buttonBg} ${themeStyles.buttonHoverBg} text-white`}
                      >
                        <MessageSquare size={16} /> Chat
                      </button>
                      <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${themeStyles.buttonBg} ${themeStyles.buttonHoverBg} text-white`}
                      >
                        <Phone size={16} /> Call
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={`${themeStyles.cardBg} ${themeStyles.border} border`}>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className={`${themeStyles.accentBg} p-4 rounded-lg`}>
                  <p className="text-sm">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className={`${themeStyles.accentBg} p-4 rounded-lg`}>
                  <p className="text-sm">Upcoming</p>
                  <p className="text-2xl font-bold">{stats.upcoming}</p>
                </div>
                <div className={`${themeStyles.accentBg} p-4 rounded-lg`}>
                  <p className="text-sm">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <div className={`${themeStyles.accentBg} p-4 rounded-lg`}>
                  <p className="text-sm">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <div className={`${themeStyles.accentBg} p-4 rounded-lg`}>
                  <p className="text-sm">Cancelled</p>
                  <p className="text-2xl font-bold">{stats.cancelled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Doctor management */}
        <div className="space-y-6">
          <Card className={`${themeStyles.cardBg} ${themeStyles.border} border`}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Available Time Slots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {availableSlots.map(slot => (
                  <button
                    key={slot.id}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${
                      slot.available 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                    onClick={() => toggleTimeSlot(slot.id)}
                  >
                    <span>{slot.time}</span>
                    <span className={`w-3 h-3 rounded-full ${slot.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </button>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add new time (e.g. 3:30 PM)"
                  className={`flex-1 px-3 py-2 border ${themeStyles.border} rounded-lg text-sm ${themeStyles.inputBg}`}
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                />
                <button 
                  className={`${themeStyles.buttonBg} ${themeStyles.buttonHoverBg} text-white px-3 py-2 rounded-lg transition-colors`}
                  onClick={addNewTimeSlot}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className={`${themeStyles.cardBg} ${themeStyles.border} border`}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Pending Appointment Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingAppointments.filter(apt => apt.status === "pending").map(appointment => (
                  <div 
                    key={appointment.id} 
                    className={`${themeStyles.accentBg} p-4 rounded-lg space-y-2`}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium">{appointment.patientName}</h4>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
                    </div>
                    
                    <div className="text-sm">
                      <p>{appointment.title}</p>
                      <p className="flex items-center gap-2">
                        <Calendar size={16} /> {appointment.requestedDate}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock size={16} /> {appointment.requestedTime}
                      </p>
                      <p className="text-gray-600 mt-1">{appointment.reason}</p>
                    </div>
                    
                    <div className="mt-3 flex space-x-2">
                      <button 
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                        onClick={() => confirmAppointment(appointment.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Confirm
                      </button>
                      <button 
                        className="flex-1 bg-white border border-red-300 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center"
                        onClick={() => rejectAppointment(appointment.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export { AppointmentsPageforDoctor };
