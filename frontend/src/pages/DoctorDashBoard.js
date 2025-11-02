import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, Trash2, Check, ChevronRight, X, Phone, Video, MessageSquare, FileText, Clock4 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../utils/cards/Card";
import { useDarkMode } from '../contextAPI/contextApi';
import { NavBar } from '../Components/NavBar';
import { DoctorProfile } from "../api/doctor.api.js";
import { Footer } from '../Components/Footer.js';

const DoctorDashBoard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { themeStyles } = useDarkMode();
  const [doctor, setDoctor] = useState({
    name: "Dr. Smith",
    specialty: "Cardiologist"
  });

  const patientDetails = {
    "John Doe": {
      age: 45,
      gender: "Male",
      bloodGroup: "O+",
      previousVisits: [
        { date: "2024-12-15", diagnosis: "Hypertension", prescription: "Amlodipine 5mg" },
        { date: "2024-11-20", diagnosis: "Regular Checkup", prescription: "None" }
      ],
      reports: [
        { date: "2024-12-15", type: "Blood Pressure", result: "140/90" },
        { date: "2024-11-20", type: "ECG", result: "Normal" }
      ]
    }
  };
  
  const [appointments, setAppointments] = useState([
    { id: 1, patient: "John Doe", date: "2025-01-02", time: "09:00", status: "pending" },
    { id: 2, patient: "Jane Smith", date: "2025-01-02", time: "10:30", status: "confirmed" },
    { id: 3, patient: "Mike Johnson", date: "2025-01-02", time: "14:00", status: "in-progress" }
  ]);

  const statusOptions = ["pending", "confirmed", "in-progress", "cancelled", "postponed"];

  const handleStatusChange = (id, newStatus) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status: newStatus } : apt
    ));
  }; 

  const handleDelete = (id) => {
    setAppointments(appointments.filter(apt => apt.id !== id));
  };

  const getStatusColor = (status) => {
    const statusColors = {
      confirmed: `${themeStyles.highlightBg} ${themeStyles.highlightText}`,
      pending: `${themeStyles.alertBg} ${themeStyles.alertText}`,
      'in-progress': `${themeStyles.accentBg} ${themeStyles.accentText}`,
      cancelled: 'bg-red-100 text-red-800',
      postponed: 'bg-orange-100 text-orange-800'
    };
    return statusColors[status];
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await DoctorProfile();
        // console.log(response)
        if (response.status === 200) {
          // console.log(response);
          setDoctor({
            ...response.data.data.DoctorDetails
          });
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserProfile();
  }, []);

  const PatientCard = ({ patientName }) => {
    const patient = patientDetails[patientName];
    if (!patient) return null;

    return (
      <Card className={`${themeStyles.cardBg} ${themeStyles.shadowEffect} fixed right-4 top-24 w-96`}>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className={themeStyles.text}>Patient Details</CardTitle>
          <button onClick={() => setSelectedPatient(null)} className={themeStyles.buttonHoverBg}>
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent>
          <div className={`space-y-4 ${themeStyles.text}`}>
            <div className="space-y-2">
              <h3 className="font-medium">Basic Info</h3>
              <div className={`grid grid-cols-2 gap-2 ${themeStyles.subtext}`}>
                <p>Age: {patient.age}</p>
                <p>Gender: {patient.gender}</p>
                <p>Blood Group: {patient.bloodGroup}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Previous Visits</h3>
              <div className={`space-y-2 ${themeStyles.subtext}`}>
                {patient.previousVisits.map((visit, idx) => (
                  <div key={idx} className={`p-2 rounded ${themeStyles.accentBg}`}>
                    <p>Date: {visit.date}</p>
                    <p>Diagnosis: {visit.diagnosis}</p>
                    <p>Prescription: {visit.prescription}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Reports</h3>
              <div className={`space-y-2 ${themeStyles.subtext}`}>
                {patient.reports.map((report, idx) => (
                  <div key={idx} className={`p-2 rounded ${themeStyles.accentBg}`}>
                    <p>{report.type}: {report.result}</p>
                    <p>Date: {report.date}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button className={`p-2 rounded ${themeStyles.buttonBg} text-white`}>
                <Phone className="h-5 w-5" />
              </button>
              <button className={`p-2 rounded ${themeStyles.buttonBg} text-white`}>
                <Video className="h-5 w-5" />
              </button>
              <button className={`p-2 rounded ${themeStyles.buttonBg} text-white`}>
                <MessageSquare className="h-5 w-5" />
              </button>
              <button className={`p-2 rounded ${themeStyles.buttonBg} text-white`}>
                <FileText className="h-5 w-5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const AppointmentList = () => (
    <Card className={`${themeStyles.cardBg} ${themeStyles.shadowEffect}`}>
      <CardHeader>
        <CardTitle className={themeStyles.text}>Your Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-gray-200">
          {appointments.map(appointment => (
            <div key={appointment.id} className="py-4 flex items-center justify-between">
              <div>
                <h3 className={`font-medium ${themeStyles.text}`}>{appointment.patient}</h3>
                <div className={`text-sm flex items-center gap-2 ${themeStyles.subtext}`}>
                  <Calendar className="h-4 w-4" />
                  {appointment.date} at {appointment.time}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={appointment.status}
                  onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                  className={`px-2 py-1 rounded-full text-sm ${getStatusColor(appointment.status)}`}
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setSelectedPatient(appointment.patient)}
                  className={`p-2 rounded-full ${themeStyles.buttonHoverBg}`}
                >
                  <ChevronRight className={`h-5 w-5 ${themeStyles.iconColor}`} />
                </button>
                <button
                  onClick={() => handleDelete(appointment.id)}
                  className={`p-2 rounded-full ${themeStyles.buttonHoverBg}`}
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const Overview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className={`${themeStyles.cardBg} ${themeStyles.shadowEffect}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${themeStyles.text}`}>
            <User className={themeStyles.iconColor} />
            Today's Appointments
          </CardTitle>
        </CardHeader>
        <CardContent className={themeStyles.text}>
          <div className="text-2xl font-bold">{appointments.length}</div>
        </CardContent>
      </Card>
      
      <Card className={`${themeStyles.cardBg} ${themeStyles.shadowEffect}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${themeStyles.text}`}>
            <Clock className={themeStyles.iconColor} />
            Pending Confirmations
          </CardTitle>
        </CardHeader>
        <CardContent className={themeStyles.text}>
          <div className="text-2xl font-bold">
            {appointments.filter(apt => apt.status === "pending").length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
  // ... rest of the component remains the same ...

  return (
    <>
    <div className={`min-h-screen ${themeStyles.background}`}>
      <NavBar />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${themeStyles.text}`}>Welcome back, {doctor.name}</h1>
          <p className={themeStyles.subtext}>{doctor.specialty}</p>
        </div>

        <div className="mb-6">
          <div className={`border-b ${themeStyles.borderColor}`}>
            <nav className="flex gap-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-4 -mb-px transition-colors ${
                  activeTab === 'overview'
                    ? `border-b-2 ${themeStyles.accentText} border-current`
                    : themeStyles.subtext
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-2 px-4 -mb-px transition-colors ${
                  activeTab === 'appointments'
                    ? `border-b-2 ${themeStyles.accentText} border-current`
                    : themeStyles.subtext
                }`}
              >
                Appointments
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'overview' ? < Overview /> : <AppointmentList />}
        {selectedPatient && <PatientCard patientName={selectedPatient} />}
      </div>
    </div>
    < Footer />
    </>
  );
};

export { DoctorDashBoard };