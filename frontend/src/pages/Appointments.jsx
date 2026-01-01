import React, { useState, useEffect } from 'react';
import { appointmentService } from '../services/appointment.service.js';
import { useAuth } from '../context/AuthContext.jsx';
import PaymentModal from '../components/PaymentModal.jsx';
import { Calendar, Clock, X, DollarSign, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

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
      
      // Log first appointment structure for debugging
      if (apps.length > 0) {
        console.log('Sample appointment structure:', apps[0]);
      }
      
      setAppointments(apps);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
      setAppointments([]); // Ensure appointments is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await appointmentService.cancelAppointment(appointmentId, 'Cancelled by user');
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleApprove = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to approve this appointment?')) {
      return;
    }

    try {
      await appointmentService.doctorRespond(appointmentId, { action: 'approve' });
      toast.success('Appointment approved successfully');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve appointment');
    }
  };

  const handleReject = async (appointmentId) => {
    const message = window.prompt('Please provide a reason for rejection (optional):');
    if (message === null) {
      return; // User cancelled
    }

    try {
      await appointmentService.doctorRespond(appointmentId, { 
        action: 'reject',
        message: message || 'Appointment rejected by doctor'
      });
      toast.success('Appointment rejected');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject appointment');
    }
  };

  const handlePayBookingFee = async (appointment) => {
    try {
      // Get appointment details to get payment info
      const response = await appointmentService.getAppointmentDetails(appointment._id);
      
      if (response.data?.bookingFee?.clientSecret) {
        setPaymentData({
          appointmentId: appointment._id,
          amount: response.data.bookingFee.amount,
          clientSecret: response.data.bookingFee.clientSecret,
          type: 'booking_fee',
        });
        setShowPaymentModal(true);
      } else {
        toast.error('Payment information not available');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load payment information');
    }
  };

  const handlePayFullAmount = async (appointment) => {
    try {
      // Get appointment details to get payment info
      const response = await appointmentService.getAppointmentDetails(appointment._id);
      console.log("Full payment - appointment details:", response);
      if (response.data.appointment?.bookingFee?.clientSecret) {
        const newPaymentData = {
          appointmentId: appointment._id,
          amount: response.data.appointment.consultationFee,
          clientSecret: response.data.appointment.bookingFee.clientSecret,
          type: 'full_payment',
        };
        console.log("Full payment - new payment data:", newPaymentData);
        setPaymentData(newPaymentData);
        console.log("Full payment - payment data:", paymentData);
        setShowPaymentModal(true);
      } else {
        toast.error('Payment information not available');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load payment information');
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      console.log('Payment successful, paymentIntent:', paymentIntent);
      
      if (paymentData.type === 'booking_fee') {
        // Confirm booking fee payment on backend
        await appointmentService.confirmBookingFee(paymentData.appointmentId);
        toast.success('Booking fee paid! Request sent to doctor for approval.');
      } else if (paymentData.type === 'full_payment') {
        // Complete full payment - backend will verify the payment with Stripe
        await appointmentService.completePayment(paymentData.appointmentId, {
          paymentIntentId: paymentIntent.id,
        });
        toast.success('Payment completed! Your appointment is confirmed.');
      }
      
      setShowPaymentModal(false);
      setPaymentData(null);
      fetchAppointments();
    } catch (error) {
      console.error('Payment confirmation error:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm payment');
    }
  };

  // Ensure appointments is an array before filtering
  const filteredAppointments = Array.isArray(appointments)
    ? appointments.filter((app) => {
        if (filter === 'all') return true;
        if (filter === 'upcoming') {
          return new Date(app.appointmentDate) > new Date() && app.status !== 'cancelled';
        }
        if (filter === 'past') {
          return new Date(app.appointmentDate) < new Date() || app.status === 'completed';
        }
        return app.status === filter;
      })
    : [];

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Appointments</h1>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {['all', 'upcoming', 'past', 'pending_doctor_approval', 'confirmed', 'completed'].map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {f.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            )
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="card">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-500 uppercase">
                          {user?.role === 'patient' ? 'Doctor' : 'Patient'}:
                        </span>
                        <h3 className="text-xl font-semibold">
                          {(() => {
                            if (user?.role === 'patient') {
                              // For patients: show doctor name
                              const doctorName = 
                                appointment.doctorId?.userId?.name || 
                                appointment.doctorId?.name || 
                                'Unknown Doctor';
                              return doctorName;
                            } else {
                              // For doctors: show patient name
                              const patientName = 
                                appointment.patientId?.userId?.name || 
                                appointment.patientId?.name || 
                                'Unknown Patient';
                              return patientName;
                            }
                          })()}
                        </h3>
                      </div>
                      {user?.role === 'patient' && (
                        <>
                          {appointment.doctorId?.specialization && (
                            <p className="text-gray-600 font-medium">{appointment.doctorId.specialization}</p>
                          )}
                          {appointment.doctorId?.userId?.email && (
                            <p className="text-sm text-gray-500">📧 {appointment.doctorId.userId.email}</p>
                          )}
                        </>
                      )}
                      {user?.role === 'doctor' && (
                        <>
                          {appointment.patientId?.userId?.email && (
                            <p className="text-sm text-gray-500">📧 {appointment.patientId.userId.email}</p>
                          )}
                          {appointment.patientId?.phoneNumber && (
                            <p className="text-sm text-gray-500">📞 {appointment.patientId.phoneNumber}</p>
                          )}
                        </>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-3">{appointment.reason}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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
                    {appointment.consultationFee && (
                      <span className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>₹{appointment.consultationFee}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {/* Booking Fee Payment (if not paid) */}
                  {appointment.status === 'pending_doctor_approval' && 
                   user?.role === 'patient' && 
                   appointment.bookingFee?.paymentStatus !== 'paid' && (
                    <button 
                      onClick={() => handlePayBookingFee(appointment)}
                      className="btn-primary text-sm flex items-center justify-center space-x-1"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pay Booking Fee (₹{appointment.bookingFee?.amount || 100})</span>
                    </button>
                  )}
                  
                  {/* Full Payment (after doctor approval) */}
                  {appointment.status === 'payment_pending' && user?.role === 'patient' && (
                    <button 
                      onClick={() => handlePayFullAmount(appointment)}
                      className="btn-primary text-sm flex items-center justify-center space-x-1"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Complete Payment (₹{appointment.totalAmount || appointment.consultationFee})</span>
                    </button>
                  )}
                  {appointment.status === 'pending_doctor_approval' &&
                    user?.role === 'doctor' && (
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => handleApprove(appointment._id)}
                          className="btn-primary text-sm"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(appointment._id)}
                          className="btn-secondary text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  {(appointment.status === 'confirmed' ||
                    appointment.status === 'pending_doctor_approval') &&
                    new Date(appointment.appointmentDate) > new Date() && (
                      <button
                        onClick={() => handleCancel(appointment._id)}
                        className="btn-secondary text-sm flex items-center justify-center space-x-1"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {paymentData && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentData(null);
          }}
          amount={paymentData.amount}
          clientSecret={paymentData.clientSecret}
          onSuccess={handlePaymentSuccess}
          title={paymentData.type === 'booking_fee' ? 'Pay Booking Fee' : 'Complete Payment'}
        />
      )}
    </div>
  );
};

export default Appointments;

