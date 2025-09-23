import { Appointment } from "../models/appointment.model.js"
import { ApiResponse } from "../utilities/ApiResponse.js"
const appointmentDetails = async (req, res) => {

    try {
        const  id = req.user._id
        
        const experession = req.user.role === 'Patient' ? { patient: id} : { doctor: id };

        const AllAppointment = await Appointment.find(experession).populate("doctor").populate("patient")

        const formattedResponse = AllAppointment.map((appointment) => ({

            appointmentId: appointment._id,
            appointmentDate: appointment.dateTime,
            appointmentSlot: appointment.slot,
            appointmentType: appointment.type,
            appointmentStatus: appointment.status,
            appointmentFees: appointment.fee.amount,
            appointmentFeesStatus: appointment.fee.status,
            appointmentPersonDetails: req.user.role === 'Patient' ? {
                doctorName: appointment.doctor.name,
                doctorId: appointment.doctor._id,
                doctorImage: appointment.doctor.profilePic,
                doctorSpeciality: appointment.doctor.speciality,
                doctorAddress: appointment.doctor.address,
                doctorPhone: appointment.doctor.phone,
                doctorEmail: appointment.doctor.email,
                doctorExperience: appointment.doctor.experience,
                doctorRating: appointment.doctor.averageRating
            } :{
                patientName: appointment.patient.name,
                patientId: appointment.patient._id,
                patientImage: appointment.patient.profilePic,
                patientAddress: appointment.patient.address,
                patientPhone: appointment.patient.phone,
                patientEmail: appointment.patient.email,
                patientGender: appointment.patient.gender,
                patientAge: appointment.patient.age,
                patientHeight: appointment.patient.height,
                patientWeight: appointment.patient.weight,
                patientBloodGroup: appointment.patient.bloodGroup
            }
        })) 
        return res.status(200).json(new ApiResponse(200, { formattedResponse }))
        
    } catch (error) {
        console.log("error: ", error)
    }
}

const updateAppointmentStatus = async (req, res) => {
    const { status, dateTime } = req.body;

    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        if (status) appointment.status = status;
        if (dateTime) appointment.dateTime = dateTime;

        await appointment.save();

        return res.status(200).json(new ApiResponse(200, { message: "Appointment status updated successfully" }));
    } catch (error) {
        console.error("Error updating appointment status:", error);
        return res.status(500).json({ error: "Failed to update appointment status" });
    }   

}

export { appointmentDetails, updateAppointmentStatus }