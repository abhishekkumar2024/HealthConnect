import { Appointment } from "../models/Appointment.model.js";
import { Patient } from "../models/Patient.model.js";
import { Doctor } from "../models/Doctor.model.js";
// const notificationForPatient  = async (req, res) => {
//     try {

//         const patient = await Patient.findById(req.user._id);
//         // console.log(patient)
//         if (!patient) {
//             return res.status(404).json({ error: "Patient not found" });
//         }
//         const notifications = await Notification.find({ patient: patient._id });

//         console.log(notifications);
//         // take doctor Id from notification and fetch doctor details
//         const doctorIds = notifications.map((notification) => notification.doctor);

//         const doctors = await Doctor.find({ _id: { $in: doctorIds } });

//         // formated Notification message for patient for every doctors

//         const formattedNotifications = notifications.map((notification) => {
//             const doctor = doctors.find((d) => d._id.toString() === notification.doctor.toString());
//             return {
//                 patient: patient.name,
//                 doctor: doctor.name,
//                 message: `Appointment Booking with ${doctor.name} in progress`,
//                 isReadPatient: notification.isReadPatient,
//             };
//         });
//         console.log(formattedNotifications)
//         res.status(200).json(formattedNotifications);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }

const notificationForPatient = async (req, res) => {
    try {
        // Fetch the patient by their ID
        const patient = await Patient.findById(req.user._id);

        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        // Fetch all appointments for this patient
        const appointments = await Appointment.find({ patient: patient._id });

        // Map through appointments and fetch doctor details asynchronously
        const formattedNotifications = await Promise.all(
            appointments.map(
                async (appointment) => {
                const doctorsId = appointment.doctor;
                
                // Await the doctor details
                const doctor = await Doctor.findById(doctorsId);

                // Check if doctor exists
                if (!doctor) {
                    return {
                        patient: patient.name,
                        doctor: "Doctor not found",
                        status: appointment.status,
                        message: `Appointment Booking with Unknown Doctor`,
                        isReadPatient: appointment.isReadPatient,
                        slot: appointment.slot,
                        type: appointment.type
                    };
                }

                return {
                    patient: patient.name,
                    doctor: doctor.name,
                    status: appointment.status,
                    message: `Appointment Booking with ${doctor.name}`,
                    isReadPatient: appointment.isReadPatient,
                    slot: appointment.slot,
                    type: appointment.type
                };
            })
        );

        // Send the formatted notifications response
        res.status(200).json(formattedNotifications);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const notificationForDoctor = async (req, res) => {
    try {
        // Fetch the doctor by their ID
        const doctor = await Doctor.findById(req.user._id);

        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }

        // Fetch all appointments for this doctor
        const appointments = await Appointment.find({ doctor: doctor._id });

        // Map through appointments and fetch patient details asynchronously
        const formattedNotifications = await Promise.all(
            appointments.map(
                async (appointment) => {
                    const patientsId = appointment.patient;
                    
                    // Await the patient details
                    const patient = await Patient.findById(patientsId);

                    // Check if patient exists
                    if (!patient) {
                        return {
                            patient: "Patient not found",
                            doctor: doctor.name,
                            status: appointment.status,
                            message: `Appointment Booking with Unknown Patient`,
                            isReadPatient: appointment.isReadPatient,
                            slot: appointment.slot,
                            type: appointment.type
                        };
                    }

                    return {
                        patient: patient.name,
                        doctor: doctor.name,
                        status: appointment.status,
                        message: `Appointment Booking with ${patient.name}`,
                        isReadPatient: appointment.isReadPatient,
                        slot: appointment.slot,
                        type: appointment.type
                    };
                }
            )
        );

        // Send the formatted notifications response
        res.status(200).json(formattedNotifications);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export { notificationForPatient, notificationForDoctor };
