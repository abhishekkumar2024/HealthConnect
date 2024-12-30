import User from '../models/user.model.js'
import { refreshTokenAndAccessToken } from '../utilities/refreshTokenAndAccessToken.js';

const RegisterUser = async (req,  res) => {
    const user = req.body;
    console.log(typeof (req.body))
    const { role, password, phoneOrEmail } = user
    if (!user || !role || !password || !phoneOrEmail) {
        return res.status(409).json({ message: "please provide all require credential !" })
    }

    const isUserExist = await User.findOne({
        $or: [
            { phone: phoneOrEmail },
            { email: phoneOrEmail }
        ]
    });


    if (isUserExist) {
        return res.status(409).json({ message: "User already exists with the given credentials." })
    }

    const newUser = new User(
        {
            password: password,
            phone: phoneOrEmail ? phoneOrEmail : null,
            email: phoneOrEmail ? phoneOrEmail : null
        }
    )

    const savedUser = await newUser.save()

    return res.status(201).json({
        message: "User registered successfully.",
        user: { id: savedUser._id, role: savedUser.role }
    });
}

const LoginUser = async (req, res) => {
    try {
        // console.log("x")
        const { phoneOrEmailIdvalue, password } = req.body;

        if (!phoneOrEmailIdvalue || !password) {
            return res.status(409).json({ message: "Please fill in the credentials!" });
        }

        const user = await User.findOne({
            $or: [
                { email: phoneOrEmailIdvalue },
                { phone: phoneOrEmailIdvalue }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isPasswordCorrect = await user.isPasswordCorrect(password);
        // console.log(isPasswordCorrect)
        if (!isPasswordCorrect) {
            return res.status(409).json({ message: "Password is incorrect!" });
        }

        const { refreshToken, accessToken } = await refreshTokenAndAccessToken(user._id);

        const loggedInUser = await User.findById(user._id).select("-refreshToken -password");

        const options = {
            httpOnly: true,
            secure: false, // true in production
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            // domain: process.env.NODE_ENV === 'production' ? 'yourwebsite.com' : 'localhost',
            path: '/'
        };

        res.cookie("accessToken", accessToken, options)
           .cookie("refreshToken", refreshToken, options)

           
            res.status(200)
            .json({
                message: "Successfully logged in!",
                user: loggedInUser
                // refreshToken: refreshToken,
                // accessToken: accessToken
            });
        // console.log(res.getHeaders()["set-cookie"]);
    } catch (error) {
        return res.status(500).json({ message: "Server error.", error: error.message });
    }
};

const LogoutUser = async (req, res) => {
    console.log("x")
    const options = {
        httpOnly: true,
        secure: false, // true in production
        sameSite: 'strict',
        maxAge: 0,
        // domain: process.env.NODE_ENV === 'production' ? 'yourwebsite.com' : 'localhost',
    }
    try {
        // console.log(req.cookies.refreshToken)
        res.clearCookie("accessToken")
           .clearCookie("refreshToken")
           .status(200)
           .json({ message: "Logged out successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Server error.", error: error.message });
    }
}

export { RegisterUser, LoginUser, LogoutUser }