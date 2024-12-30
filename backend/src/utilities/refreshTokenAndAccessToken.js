import User from "../models/user.model.js"
// import { ApiErrors } from "./ApiError.js"
const refreshTokenAndAccessToken= async(user_id)=>{
    try {
        const user=await User.findById(user_id)
        const refreshToken=await user.generateToken("refresh")
        const accessToken=await user.generateToken("access")
        // console.log(refreshToken)
        // console.log(accessToken)
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {refreshToken,accessToken}

    } catch (error) {
        console.log(error)
        return error
    }
}

export {refreshTokenAndAccessToken}