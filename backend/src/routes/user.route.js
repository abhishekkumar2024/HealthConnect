import { Router } from "express";
import { LoginUser, RegisterUser, LogoutUser, SentOTP } from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middlleware.js";
import { PatientProfile, SavePatientData } from "../controller/patient.controller.js";
import { DoctorProfile, SaveDoctorProfile } from "../controller/doctor.controller.js";
import { SendUserId } from "../controller/user.controller.js";
import { saveProfilePhoto } from "../controller/doctor.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router()

router.route("/register").post(RegisterUser);
router.route("/login").post(LoginUser);
// router.route("/patient-dashboard/:id").get(verifyJWT,LoginUser);
router.route("/logout").get(verifyJWT,LogoutUser);

router.route("/Patientprofile").get(verifyJWT,PatientProfile);

router.route("/Doctorprofile").get(verifyJWT,DoctorProfile);
router.route("/save-profile").post(verifyJWT,SavePatientData);

router.route("/save-doctor-profile").post(verifyJWT,SaveDoctorProfile);

router.route("/save-profile-photo").post(upload.single('profilepic'),verifyJWT,saveProfilePhoto);
router.route("/sent-otp").post(SentOTP);
router.route("/verifyJWT").get(verifyJWT,SendUserId);

export default router