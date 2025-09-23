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
        // console.log(DoctorDetails)
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
        // console.log(req.body)
        // console.log(details.consultationfee)
        // console.log(typeof(details.consultationfee))
        // console.log(typeof(parseInt(details.consultationfee)))
        const response = await Doctor.findByIdAndUpdate(
            req.user._id,
            {
                ...details,
                consultationFee: parseInt(details.consultationfee)
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

const FetchDoctorBasedOnId = async (req,res) => {
    try {
        const id = req.params.id
        if(!id){
            throw new ApiErrors(404,"server error")
        }
        const response = await Doctor.findById(id)

        const formattedResponse = {
            name: response.name,
            specialization: response.specialization,
            experience: response.experience,
            consultationFee: response.consultationFee,
            profilepic: response.profilepic
        }
        console.log(formattedResponse)
        return res.status(200).json(
            new ApiResponse(
                200,
                formattedResponse,
                "file uploaded successfully"
            )
        )
    } catch (error) {
        
    }
}


export { DoctorProfile, SaveDoctorProfile, saveProfilePhoto, FetchDoctorBasedOnId }