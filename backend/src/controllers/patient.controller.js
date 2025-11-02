import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import { ObjectId } from "mongodb";
import ApiErrors  from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";

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

export { PatientProfile, SavePatientData };
