import { Patient } from '../models/patient.model.js';
import { Doctor } from '../models/doctor.model.js';
import User from '../models/user.model.js';
import { refreshTokenAndAccessToken } from '../utilities/refreshTokenAndAccessToken.js';
import twilio from 'twilio';
import { ApiErrors } from '../utilities/ApiError.js';
import { ApiResponse } from '../utilities/ApiResponse.js';
import { Model } from 'mongoose';

const twilioClient = twilio(
    process.env.your_twilio_account_sid,
    process.env.your_twilio_auth_token
);
const TWILIO_PHONE_NUMBER = process.env.your_twilio_phone_number;

const RegisterUser = async (req, res) => {
    try {
        const { role, password, email } = req.body;
        console.log(role, password, email)

        if (!req.body || !role || !password || !email) {
            throw new ApiErrors(400, "Please provide all required credentials!");
        }

        const UserModel = role === "Patient" ? Patient : Doctor;

        const isUserExist = await UserModel.findOne({
            $or: [{ email: email }]
        });

        if (isUserExist) {
            throw new ApiErrors(409, "User already exists with the given credentials.");
        }

        const newUser = new UserModel({
            password,
            email,
            role,
            license: Math.floor(Math.random() * 1000000)
        });

        const savedUser = await newUser.save({ validateBeforeSave: true });

        return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    { id: savedUser._id, role: savedUser.role },
                    `${role} registered successfully.`
                )
            );
    } catch (error) {
        if (error instanceof ApiErrors) {
            throw error;
        }
        throw new ApiErrors(500, "Error while registering user", error.message);
    }
};

const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password)
        if (!email || !password) {
            throw new ApiErrors(400, "Please fill in the credentials!");
        }

        const user = await User.findOne({
            $or: [{ email: email }]
        });

        if (!user) {
            throw new ApiErrors(404, "User not found.");
        }

        const isPasswordCorrect = await user.isPasswordCorrect(password);

        if (!isPasswordCorrect) {
            throw new ApiErrors(401, "Invalid credentials");
        }

        const { refreshToken, accessToken } = await refreshTokenAndAccessToken(user._id);
        const loggedInUser = await User.findById(user._id).select("-refreshToken -password");

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/'
        };
        return res
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { user: loggedInUser },
                    "Successfully logged in!"
                )
            );
    } catch (error) {
        if (error instanceof ApiErrors) {
            throw error;
        }
        throw new ApiErrors(500, "Error while logging in", error.message);
    }
};

const LogoutUser = async (req, res) => {
    try {
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
            maxAge: 0,
        };

        return res
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Logged out successfully!"
                )
            );
    } catch (error) {
        throw new ApiErrors(500, "Error while logging out", error.message);
    }
};

const SentOTP = async (req, res) => {
    try {
        const { phoneOrEmail } = req.body;

        if (!phoneOrEmail) {
            throw new ApiErrors(400, "Please enter the phone or email!");
        }

        const user = await User.findOne({
            $or: [
                { email: phoneOrEmail },
                { phone: phoneOrEmail }
            ]
        });

        if (!user) {
            throw new ApiErrors(404, "User not found!");
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        user.otp = otp;
        await user.save({ validateBeforeSave: false });

        try {
            const verification = await twilioClient.verify.v2
                .services("VAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
                .verifications.create({
                    channel: "sms",
                    to: `+91${phoneOrEmail}`,
                });

            if (verification.status === "pending") {
                return res
                    .status(200)
                    .json(
                        new ApiResponse(
                            200,
                            { status: verification.status },
                            "OTP sent successfully!"
                        )
                    );
            } else {
                throw new ApiErrors(500, "Failed to send OTP");
            }
        } catch (twilioError) {
            throw new ApiErrors(500, "Error sending OTP through Twilio", twilioError.message);
        }
    } catch (error) {
        if (error instanceof ApiErrors) {
            throw error;
        }
        throw new ApiErrors(500, "Error while sending OTP", error.message);
    }
};

const SendUserId = async (req, res) => {
    try {
        const user = req.user;
        
        if (!user) {
            throw new ApiErrors(404, "User not found");
        }
        console.log(user)
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { user },
                    "User details fetched successfully"
                )
            );
    } catch (error) {
        if (error instanceof ApiErrors) {
            throw error;
        }
        throw new ApiErrors(500, "Error while fetching user details", error.message);
    }
};

const locationSearch = async (req, res) => {
    const searchQuery = req.body
    searchQuery = searchQuery.trim()
    
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              searchQuery
            )}&limit=5&addressdetails=1`
        ); 
        const data = await response.json();

        const formattedSuggestions = data.map(item => ({
            id: item.place_id,
            mainText: item.address?.road || item.address?.suburb || item.address?.city || item.display_name.split(',')[0],
            secondaryText: [
              item.address?.city,
              item.address?.state,
              item.address?.country
            ].filter(Boolean).join(', '),
            fullAddress: item.display_name,
            coordinates: {
              lat: item.lat,
              lon: item.lon
            }
          }));
        // console.log(formattedSuggestions)
        return new ApiResponse(200,
            "Success",
            formattedSuggestions)

    } catch (error) {
        console.log(error)
        throw new ApiErrors(
            500,
            "Error while fetching location",
            error.message
        )
    }
}

const SearchBar = async (req, res) => {
    const query = req.body
    console.log(query.search)
    try {
        const searchQuery = { $text: { $search: `${query.search}` } };
        const Response = await Doctor.find(searchQuery)
        console.log(Response)
        return Response
    } catch (error) {
        console.log(error)
        throw new ApiErrors()
    }
}
export {
    RegisterUser,
    LoginUser,
    LogoutUser,
    SentOTP,
    SendUserId,
    SearchBar,
    locationSearch
};