import User from '../models/user.model.js'

const RegisterUser = async (req,res) =>{
    const user = req.body;
    console.log(typeof(req.body))
    const {role,password,phoneOrEmail} = user
    if(!user || !role || !password || !phoneOrEmail ){
        return res.status(409).json({ message: "please provide all require credential !" })
    }

    const isUserExist = await User.findOne({
        $or: [
            { phone: phoneOrEmail },
            { email: phoneOrEmail }
        ]
    });


    if(isUserExist){
        return res.status(409).json({ message: "User already exists with the given credentials." })
    }

    const newUser = new User(
        {
            password : password,
            phone: phoneOrEmail ? phoneOrEmail : null ,
            email: phoneOrEmail ? phoneOrEmail : null
        }
    )

    const savedUser = await newUser.save()
    
    return res.status(201).json({
        message: "User registered successfully.",
        user: { id: savedUser._id, role: savedUser.role }
    });
}
export { RegisterUser }