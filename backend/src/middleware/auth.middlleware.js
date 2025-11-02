import User from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { ApiErrors } from "../utilities/ApiError.js";
import { Patient } from "../models/patient.model.js";
import { Doctor } from "../models/doctor.model.js";

const verifyJWT = async (req, _, next) => {
    try {
        // console.log("verifyJWT")
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (accessToken === null || accessToken === undefined) {
            next( new ApiErrors(401, "Unauthorized request||please logIn first)"))
        }
        const decodedToken = jwt.verify(accessToken, process.env.access_WebToken_Secure)
        // console.log(decodedToken)
        const UserModel  = decodedToken.role === 'Doctor' ? Doctor : Patient

        const user = await UserModel.findById(decodedToken._id)?.select("-password -refreshToken")

        if (!user) {
            throw new ApiErrors(401, "Invalid Access Token")
        }
        req.user = user
    } catch (error) {
        next(error)
    }
    next()
}
export { verifyJWT }