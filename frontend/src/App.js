import { NavBar } from "./Components/NavBar";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Home } from "./pages/Home"
import { Login } from "./pages/Login"
import { PatientDashboard } from "./pages/PatientDashBoard.js"
import { Register } from "./pages/Register";
import { ResetPassword } from "./pages/ResetPassword"
import { PatientProfileDetails } from "./pages/PatientProfile.js";
import { AppointmentsPage } from "./pages/Appointment.js";
import { SettingsPage } from "./pages/Setting.js";
import { HelpPage } from "./pages/HelpPage.js";
import { DoctorDashBoard } from "./pages/DoctorDashBoard.js";
import { DoctorProfileDetails } from "./pages/DoctorProfile.js";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-600 border-solid border-blue-950 border-4 text-white">
        <div className="bg-blue-300">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/patient/:id" element={<PatientDashboard />} />
            {/* <Route path="/doctor/:id" element={<DoctorDashboard />} /> */}
            <Route path="/forgot-password" element={<ResetPassword />} />
            <Route path="/patient-profile/:id" element={< PatientProfileDetails />} />
            <Route path="/doctor-profile/:id" element={< DoctorProfileDetails />} />
            <Route path="/appointments/:id" element={< AppointmentsPage />} />
            <Route path="/setting/:id" element={< SettingsPage />} />
            <Route path="/help" element={< HelpPage />} />
            <Route path="/Doctor-Dashboard/:id" element={< DoctorDashBoard/>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
