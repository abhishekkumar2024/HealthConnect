import { NavBar } from "./Components/NavBar";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Home } from "./pages/Home"
import { Login } from "./pages/Login"
import { PatientDashboard } from "./pages/PatientDashBoard.js"
import { Register } from "./pages/Register";
import { ResetPassword } from "./pages/ResetPassword"
import { PatientProfileDetails } from "./pages/PatientProfile.js";
import { AppointmentsPageforDoctor } from "./pages/AppointmentForDoctor.js";
import { SettingsPage } from "./pages/Setting.js";
import { HelpPage } from "./pages/HelpPage.js";
import { DoctorDashBoard } from "./pages/DoctorDashBoard.js";
import { DoctorProfileDetails } from "./pages/DoctorProfile.js";
import { BookingCard } from "./Components/BookingCard.js";
import { AppointmentsPageforPatient } from "./pages/AppointmentForPatient.js";

function App() {
  return (
    <Router>
      <div className="min-h-screenflex flex-col bg-blue-300 text-white">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/patient/:id" element={<PatientDashboard />} />
            {/* <Route path="/doctor/:id" element={<DoctorDashboard />} /> */}
            <Route path="/forgot-password" element={<ResetPassword />} />
            <Route path="/patient-profile/:id" element={< PatientProfileDetails />} />
            <Route path="/doctor-profile/:id" element={< DoctorProfileDetails />} />
            <Route path="/appointments-for-doctor/:id" element={< AppointmentsPageforDoctor />} />
            <Route path="/appointment-for-patient/:id" element={< AppointmentsPageforPatient />} />
            <Route path="/setting/:id" element={< SettingsPage />} />
            <Route path="/help" element={< HelpPage />} />
            <Route path="/Doctor-Dashboard/:id" element={< DoctorDashBoard/>} />
            <Route path="/Booking/:id?" element={<BookingCard />} />
          </Routes>
      </div>
    </Router>
  );
}

export default App;
