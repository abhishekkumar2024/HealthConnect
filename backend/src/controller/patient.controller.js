import User from "../models/user.model.js";
import { Patient } from "../models/patient.model.js";
import { Doctor } from "../models/doctor.model.js";
import { Appointment } from "../models/appointment.model.js";
import { ObjectId } from "mongodb";
import { ApiErrors } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { Notification } from "../models/notification.model.js";

const PatientProfile = async (req, res) => {
    const id = req.user?._id || undefined;

    if (!id) {
        throw new ApiErrors(404, "You are not logged in");
    }

    try {
        const user = await Patient.findById(id).select("-refreshToken -accessToken -password -IsDeleted -IsBlocked -IsVerified");
        if (!user) {
            return res.status(200).json(new ApiResponse(200, null, "User not found"));
        }

        const formattedDate = new Date(user.dateofbirth).toISOString().slice(0, 10);
        const objectId = new ObjectId(user._id);
        const formattedHealthId = objectId.toString().match(/\d+/g)[0];
        user.healthid = formattedHealthId

        return res.status(200).json(new ApiResponse(200, {
            user: user,
        }));
    } catch (error) {
        throw new ApiErrors(500, "Internal Server Error", [], error.stack);
    }
};

const SavePatientData = async (req, res) => {
    try {
        const { email, phone, bmi, address, gender, bloodgroup, weight, height, name, dateofbirth, role } = req.body;

        const id = req.user?._id || undefined;

        if (!id) {
            throw new ApiErrors(404, "You are not logged in");
        }

        const updatedUser = await Patient.findByIdAndUpdate(
            id,
            {
                email,
                phone,
                address,
                bmi,
                gender,
                bloodgroup,
                weight,
                height,
                name,
                dateofbirth,
                role
            },
            { new: true }
        );

        if (!updatedUser) {
            throw new ApiErrors(404, "User not found");
        }

        return res.status(200).json(new ApiResponse(200, updatedUser, "User data updated successfully"));
    } catch (error) {
        throw new ApiErrors(500, "Internal Server Error", [], error.stack);
    }
};

const FetchDoctorBasedOnQuery = async (req, res) => {
    try {
        const {
            speciality,
            location,
            fees,
            availability,
            minExperience,
            rating,
            page = 1,
            limit = 10
        } = req.body;

        // console.log(`Speciality: ${speciality}, Location: ${location}, Fees: ${fees}, Availability: ${availability}, Min Experience: ${minExperience}, Rating: ${rating}, Page: ${page}, Limit: ${limit}`);

        const filters = {};
        if (speciality) filters.specialization = speciality;
        if (location) filters["address.city"] = location;
        if (fees) filters.consultationFee = { $gte: parseInt(fees.match(/\d+/)[0]) }; // Ensure the field name matches your schema
        if (availability) filters.availability = availability;
        if (minExperience) filters.experience = { $gte: parseInt(minExperience.match(/\d+/)[0]) };
        if (rating) filters.averageRating = { $gte: parseFloat(rating.match(/\d+/)[0]) || 0 };

        // console.log("Filters:", filters); // Debugging

        const pipeline = [];

        // Add $match stage only if filters are present
        if (Object.keys(filters).length > 0) {
            pipeline.push({ $match: filters });
        }

        // Pagination
        pipeline.push(
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
        );

        // Formatting output
        pipeline.push({
            $project: {
                _id: 1,
                name: 1,
                specialization: 1,
                address: { $concat: ["$address.city", ", ", "$address.state", ", ", "$address.country"] },
                experience: 1,
                consultationFee: 1,
                averageRating: 1,
                qualification: 1
            }
        });

        // console.log("Pipeline:", pipeline); // Debugging

        const doctors = await Doctor.aggregate(pipeline);
        // console.log("Doctors:", doctors); // Debugging

        // Count total documents
        const totalDocs = Object.keys(filters).length > 0
            ? await Doctor.countDocuments(filters) // Count with filters
            : await Doctor.estimatedDocumentCount(); // Count all documents if no filters

        return res.status(200).json(new ApiResponse(200, {
            doctors,
            totalPages: Math.ceil(totalDocs / limit),
            currentPage: page,
            totalDoctors: totalDocs
        }, "Doctors fetched successfully based on filters"));
    } catch (error) {
        throw new ApiErrors(500, "Internal Server Error", [], error.stack);
    }
};

const BookAppointment = async (req, res) => {
    try {
        const { id, date, slot, Type } = req.body;

        let type = Type
        if (!id || !date || !slot || !type) {
            throw new ApiErrors(400, "All fields are required");
        }
        const IsFirstTimeBookingAppointment = await Appointment.findOne(
            { doctor: id, patient: req.user._id }
        );

        if (IsFirstTimeBookingAppointment) {
            throw new ApiErrors(400, "You have already booked an appointment with this doctor");
        }
        const doctor = await Doctor.findById(id);

        if (!doctor) {
            throw new ApiErrors(404, "Doctor not found");
        }
        const patient = await Patient.findById(req.user._id);

        if (!patient) {
            throw new ApiErrors(404, "Patient not found");
        }

        const patientId = req.user._id;
        const doctorId = id;

        const appointment = new Appointment({
            patient: patientId,
            doctor: doctorId,
            slot: slot,
            type: type,
            status: "in-progress",
            fee: {
                amount: doctor.consultationFee,
                status: "paid"
            }
        });

        
        // Notification
        const notification = new Notification({
            patient: patientId,
            doctor: doctorId,
            type: type
        });

        await appointment.save();

        await notification.save();

        return res.status(200).json(new ApiResponse(200, { appointment }, "Appointment booked successfully and notification sent"));
    } catch (error) {
        throw new ApiErrors(500, "Internal Server Error", [], error.stack);
    }
}
export { PatientProfile, SavePatientData, FetchDoctorBasedOnQuery, BookAppointment };
