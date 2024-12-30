import User from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { ApiErrors } from "../utilities/ApiError.js";

const verifyJWT = async (req, _, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        // console.log(accessToken)
        if (accessToken === null || accessToken === undefined) {
            throw new ApiErrors(401, "Unauthorized request||please logIn first")
        }
        const decodedToken = jwt.verify(accessToken, process.env.access_WebToken_Secure)
            
        const user = await User.findById(decodedToken._id)?.select("-password -refreshToken")
        
        // console.log("user",user)
        if (!user) {
            throw new ApiErrors(401, "Invalid Access Token")
        }
        req.user = user
    } catch (error) {
        console.log("please loggIn first")
    }
    next()
}
export { verifyJWT }