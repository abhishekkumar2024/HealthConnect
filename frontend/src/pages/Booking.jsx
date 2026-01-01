import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService } from '../services/doctor.service.js';
import { appointmentService } from '../services/appointment.service.js';
import PaymentModal from '../components/PaymentModal.jsx';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Booking = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
  });

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const response = await doctorService.getDoctors();
      const foundDoctor = response.data?.find((d) => d._id === doctorId);
      
      if (!foundDoctor) {
        toast.error('Doctor not found');
        navigate('/doctors');
        return;
      }
      
      // Ensure userId and email are available
      if (!foundDoctor.userId?.email) {
        console.warn('Doctor email not found in response:', foundDoctor);
        toast.error('Doctor information incomplete. Please try again.');
      }
      
      setDoctor(foundDoctor);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      toast.error('Failed to load doctor information');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.appointmentDate || !formData.appointmentTime || !formData.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    // Combine date and time
    const appointmentDateTime = new Date(
      `${formData.appointmentDate}T${formData.appointmentTime}`
    );

    if (appointmentDateTime < new Date()) {
      toast.error('Please select a future date and time');
      return;
    }

    setSubmitting(true);

    try {
      // Backend expects doctorEmail, not doctorId
      if (!doctor?.userId?.email) {
        toast.error('Doctor email not found. Please try again.');
        return;
      }

      const appointmentData = {
        doctorEmail: doctor.userId.email,
        appointmentDate: appointmentDateTime.toISOString(),
        reason: formData.reason,
      };

      const response = await appointmentService.requestAppointment(appointmentData);
      
      // If booking fee is required, show payment modal
      if (response.data?.bookingFee?.clientSecret) {
        setPaymentData({
          appointmentId: response.data.appointmentId,
          amount: response.data.bookingFee.amount,
          clientSecret: response.data.bookingFee.clientSecret,
        });
        setShowPaymentModal(true);
        toast.success('Please complete booking fee payment to proceed');
      } else {
        toast.success('Appointment request submitted successfully!');
        navigate('/appointments');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      // Confirm booking fee payment on backend
      await appointmentService.confirmBookingFee(paymentData.appointmentId);
      toast.success('Booking fee paid! Request sent to doctor for approval.');
      setShowPaymentModal(false);
      navigate('/appointments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm payment');
    }
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
        <button onClick={() => navigate('/doctors')} className="text-primary-600 hover:underline mt-4">
          Browse doctors
        </button>
      </div>
    );
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Appointment</h1>
        <p className="text-gray-600">Schedule an appointment with {doctor.userId?.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Doctor Info */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 font-bold text-3xl">
                  {doctor.userId?.name?.charAt(0) || 'D'}
                </span>
              </div>
              <h3 className="text-xl font-semibold">{doctor.userId?.name}</h3>
              <p className="text-gray-600">{doctor.specialization}</p>
            </div>
            {doctor.consultationFee && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-1">Consultation Fee</p>
                <p className="text-2xl font-bold text-primary-600">₹{doctor.consultationFee}</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card space-y-6">
            <div>
              <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Appointment Date
              </label>
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                required
                min={today}
                className="input-field"
                value={formData.appointmentDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Appointment Time
              </label>
              <input
                type="time"
                id="appointmentTime"
                name="appointmentTime"
                required
                className="input-field"
                value={formData.appointmentTime}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Reason for Visit
              </label>
              <textarea
                id="reason"
                name="reason"
                required
                rows={4}
                className="input-field"
                placeholder="Describe your symptoms or reason for the appointment..."
                value={formData.reason}
                onChange={handleChange}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 btn-primary"
              >
                {submitting ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentData && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={paymentData.amount}
          clientSecret={paymentData.clientSecret}
          onSuccess={handlePaymentSuccess}
          title="Pay Booking Fee"
        />
      )}
    </div>
  );
};

export default Booking;

