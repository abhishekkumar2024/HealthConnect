import User from "../models/user.model.js"

const PatientDashboard = async (req, res) => {
    // const id = req.user._id
    // console.log(req.user)
    const id = req.user._id
    try {
        const user = await User.findById(id)

        if (!user) {
            res.status(200).json({ message: "User not found" })
        }

        res.status(200).
            json({
                _id: user._id,
                email: user.email,
                phone: user.phone,
                name: user.name,
                age: user.age,
                address: user.address,
                gender: user.gender,
                bloodgroup: user.bloodgroup,
                weight: user.weight,
                height: user.height,
                bmi: user.bmi,
                dateofbirth: user.dateofbirth,
                role: user.role,
                city: user.city,
                state: user.state,
                country: user.country,
                pincode: user.pincode
            })
        return res;
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })

    }
}

const SavePatientData = async (req, res) => {
    try {
        // console.log("")
        const { email, phone, bmi, address, gender, bloodgroup, weight, height, name, state,
            city,
            country,
            pincode,
            dateofbirth,
            role } = req.body

        const id = req.user._id

        console.log(req.body)

        // console.log(bloodgroup)
        const newUser = await User.findByIdAndUpdate(
            id,
            {
                email,
                phone,
                address,
                bmi,
                address,
                gender,
                bloodgroup: bloodgroup,
                weight,
                height,
                name,
                state,
                city,
                country,
                pincode,
                dateofbirth,
                role
            },
            { new: true }
        )
        console.log(newUser)
        res.status(200).json({ message: "User data updated successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error", error: error
        })

    }
}
export { PatientDashboard, SavePatientData }  