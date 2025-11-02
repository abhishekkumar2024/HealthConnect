import { useEffect, useState } from "react";
import { useParams, useNavigate} from "react-router-dom";
import { FetchDoctorBasedOnId, BookAppointment } from "../api/doctor.api";
import { set } from "mongoose";

const BookingCard = () => {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [doctorDetails, setDoctorDetails] = useState({
    name: "",
    specialization: "",
    experience: 0,
    consultationFee: 0,
    profilepic: "",
  });

  const [Type, setType] = useState("");

  const navigate = useNavigate();
  
  const { id } = useParams(); // Extract id from URL

  const isButtonDisabled = !date || !slot;

  const handleProceedToPayment = async () => {
    const isSuccessfulPayment = true; // Simulating payment

    if (isSuccessfulPayment) {
      try {
        console.log(id, date, slot, Type);
        const response = await BookAppointment({ id, date, slot, Type });
        if (response.status === 200) {
          navigate("/")
        } else {

        }
      } catch (error) {
        console.error("Error booking appointment:", error);
        alert("Something went wrong. Please try again later.");
      }
    }
  };

  const fetchDoctor = async () => {
    try {
      const response = await FetchDoctorBasedOnId(id);
      console.log("API Response:", response.data); // Debugging

      // Make sure you are accessing the correct data structure
      setDoctorDetails((prev) => ({
        ...prev,
        ...response.data.data, // Change to response.data if needed
      }));
    } catch (error) {
      console.error("Error fetching doctor details:", error);
    }
  };

  useEffect(
    () => {
      fetchDoctor()
    }, [id]); // Moved `useEffect` to the correct position

    const getTodayIST = () => {
      const now = new Date();
      now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + 330); // Convert to IST (UTC+5:30)
      return now.toISOString().split("T")[0];
    };
  return (
    <div className="flex justify-center items-center h-screen bg-blue-200">
      <div className="bg-white shadow-2xl rounded-2xl p-6 w-96 transition transform hover:scale-105 hover:shadow-xl">
        {/* Doctor Info */}
        <div className="flex items-center space-x-4">
          <img
            src={doctorDetails.profilepic || "https://via.placeholder.com/80"}
            alt="Doctor"
            className="w-16 h-16 rounded-full border-2 border-blue-400"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {doctorDetails.name || "Dr. Unknown"}
            </h2>
            <p className="text-gray-500 text-sm">
              {doctorDetails.specialization || "Specialization not available"}
            </p>
            <p className="text-gray-500 text-sm">
              {doctorDetails.experience
                ? `${doctorDetails.experience} years`
                : "Experience not available"}
            </p>
          </div>
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mt-4">
          Book Your Appointment
        </h1>

        {/* Choose a Date */}
        <div className="mt-4">
          <label htmlFor="Date" className="block text-gray-600 font-medium">
            Select Date
          </label>
          {/* choose Date today and after today formate  dd/mm/yyyy */}
          <input
            type="date"
            id="Date"
            name="Date"
            value={date}
            min={getTodayIST()}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

       {/* available slot morning and afternoon */}
       <div className="mt-4">
       <label htmlFor="Time" className="block text-gray-600 font-medium">
              Select Slot
        </label>
        <select
          id="Time"
          name="Time"
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {/* show default option */}
          <option value="" disabled>Select Slot</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
        </select>
       </div>

        {/* drop-down for Type of Consultation */}
        <div className="mt-4">
          <label htmlFor="Type" className="block text-gray-600 font-medium">
            Type of Consultation
          </label>
          <select
            id="Type"
            name="Type"
            value={Type}
            onChange={
              (e) => { setType(e.target.value) }
              }
            className="border border-gray-300 rounded-md px-4 py-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {/* show default option */}
            <option value="" disabled>Select Type</option>
            <option value="initial">Initial</option>
            <option value="follow-up">Follow-up</option>
            <option value="consultation">Consultation</option>
          </select>
        </div>

        {/* Booking Summary */}
        {date && slot && (
          <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <h3 className="font-semibold text-blue-700">Booking Summary</h3>
            <p className="text-gray-600 text-sm">
              📅 Date: <strong>{date}</strong>
            </p>
            <p className="text-gray-600 text-sm">
              ⏰ Slot: <strong>{slot}</strong>
            </p>
            <p className="text-gray-600 text-sm">
              💰 Consultation Fee: <strong>Rs{doctorDetails.consultationFee || "N/A"}</strong>
            </p>
            <p className="text-gray-600 text-sm">
              🕒 Estimated Duration: <strong>30 minutes</strong>
            </p>
          </div>
        )}

        {/* Proceed Button */}
        <button
          disabled={isButtonDisabled}
          className={`w-full mt-6 py-2 px-4 rounded-lg font-bold text-white transition ${isButtonDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-700"
            }`}
          onClick={handleProceedToPayment}
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export { BookingCard };
