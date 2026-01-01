import Doctor from "../models/doctor.model.js";

export const getDoctorsController = async (req, res) => {
    try {
        const { limit, page } = req.query;
        const doctors = await Doctor.find()
            .limit(limit)
            .skip((page - 1) * limit)
            .populate('userId', 'name email phone address specialization experience fees');
        res.status(200).json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
};

