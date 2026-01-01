import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { appointmentService } from '../services/appointment.service.js';
import { Calendar, Clock, User, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    upcoming: 0,
    pending: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getUserAppointments();
      
      // Handle different response structures
      // Backend returns: { success: true, data: { appointments: [...] } }
      let apps = [];
      if (response.data && Array.isArray(response.data.appointments)) {
        apps = response.data.appointments;
      } else if (Array.isArray(response.data)) {
        apps = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        apps = response.data.data;
      } else if (Array.isArray(response)) {
        apps = response;
      }
      
      // Ensure apps is always an array
      if (!Array.isArray(apps)) {
        console.warn('Appointments data is not an array:', apps);
        apps = [];
      }
      
      setAppointments(apps);

      // Calculate stats
      const now = new Date();
      const upcoming = apps.filter(
        (app) => new Date(app.appointmentDate) > now && app.status === 'confirmed'
      ).length;
      const pending = apps.filter(
        (app) => app.status === 'pending_doctor_approval' || app.status === 'payment_pending'
      ).length;
      const completed = apps.filter((app) => app.status === 'completed').length;

      setStats({ upcoming, pending, completed });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
      setAppointments([]); // Ensure appointments is always an array
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      pending_doctor_approval: 'bg-yellow-100 text-yellow-800',
      payment_pending: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    if (status === 'confirmed' || status === 'completed') {
      return <CheckCircle className="w-4 h-4" />;
    }
    if (status === 'cancelled' || status === 'rejected') {
      return <XCircle className="w-4 h-4" />;
    }
    return <AlertCircle className="w-4 h-4" />;
  };

  // Ensure appointments is an array before filtering
  const upcomingAppointments = Array.isArray(appointments)
    ? appointments
        .filter((app) => {
          const appDate = new Date(app.appointmentDate);
          return appDate > new Date() && app.status !== 'cancelled' && app.status !== 'completed';
        })
        .slice(0, 5)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">
          {user?.role === 'doctor' ? 'Manage your appointments' : 'Track your health appointments'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Upcoming</p>
              <p className="text-3xl font-bold">{stats.upcoming}</p>
            </div>
            <Calendar className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm mb-1">Pending</p>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Completed</p>
              <p className="text-3xl font-bold">{stats.completed}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {user?.role === 'patient' && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/doctors"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <User className="w-5 h-5" />
              <span>Find Doctors</span>
            </Link>
            <Link
              to="/appointments"
              className="btn-secondary inline-flex items-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>View All Appointments</span>
            </Link>
          </div>
        </div>
      )}

      {/* Upcoming Appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
          <Link
            to="/appointments"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No upcoming appointments</p>
            {user?.role === 'patient' && (
              <Link to="/doctors" className="text-primary-600 hover:underline mt-2 inline-block">
                Book an appointment
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {user?.role === 'patient'
                          ? appointment.doctorId?.userId?.name || 'Doctor'
                          : appointment.patientId?.userId?.name || 'Patient'}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {getStatusIcon(appointment.status)}
                        <span>{appointment.status.replace(/_/g, ' ')}</span>
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{appointment.reason}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}
                        </span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {format(new Date(appointment.appointmentDate), 'hh:mm a')}
                        </span>
                      </span>
                    </div>
                  </div>
                  {appointment.consultationFee && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Fee</p>
                      <p className="text-lg font-semibold text-primary-600">
                        ₹{appointment.consultationFee}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

