import { Doctor } from "../models/doctor.model.js";
import { Patient } from "../models/patient.model.js";
import { ApiErrors } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { cloudinaryFileUplodad } from "../utilities/cloudinary.js";
const DoctorProfile = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(400).json({ message: "please login !" });
        }

        const DoctorDetails = await Doctor.findById(user._id).select("-refreshToken -accessToken -password");

        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    { DoctorDetails },
                    "Doctor details fetched successfully"
                )
            );
    } catch (error) {
        if (error instanceof ApiErrors) {
            throw error;
        }
        throw new ApiErrors(500, "Error while fetching user details", error.message);
    }
}
const SaveDoctorProfile = async (req, res) => {
    try {
        const details = req.body
        console.log(req.body)
        const response = await Doctor.findByIdAndUpdate(
            req.user._id,
            {
                ...details
            },
            {
                new: true
            }
        )
        // console.log(response)
        return res.status(200).json(
            new ApiResponse(
                200,
                { Response },
                "Doctor details saved successfully"
            )
        )
    } catch (error) {
        console.log(error)
    }
}
const saveProfilePhoto = async (req, res) => {
    try {
        // console.log(req.user)
        const path = req.file?.path;
      
        if (!path) {
            throw new ApiErrors(404, "file is not found")
        }
        
        const profilePath = await cloudinaryFileUplodad(path)
        
        const userModel = req.user.role === 'Doctor' ? Doctor : Patient;
        
        const response = await userModel.findByIdAndUpdate(
            req.user._id, // User ID from authenticated request
            { profilepic: profilePath.url }, // Field to update
            { new: true } // Return the updated document
        );
        // console.log(response)
        return res.status(200).json(
            new ApiResponse(
                200,
                { response },
                "file uploaded successfully"
            )
        )
    } catch (error) {
        console.log("error")
        console.log(error.message)
        throw new ApiErrors(
            500,
            "Failed while uploadig",
            error.message
        )
    }
}
export { DoctorProfile, SaveDoctorProfile, saveProfilePhoto }