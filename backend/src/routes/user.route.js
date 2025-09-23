import { Router } from "express";
import { LoginUser, RegisterUser, LogoutUser, SentOTP, SearchBar } from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middlleware.js";
import { PatientProfile, SavePatientData, FetchDoctorBasedOnQuery, BookAppointment} from "../controller/patient.controller.js";
import { DoctorProfile, SaveDoctorProfile, FetchDoctorBasedOnId} from "../controller/doctor.controller.js";
import { SendUserId } from "../controller/user.controller.js";
import { saveProfilePhoto } from "../controller/doctor.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { notificationForPatient, notificationForDoctor } from "../controller/Notification.controller.js";
import { appointmentDetails, updateAppointmentStatus} from "../controller/appointment.controller.js";

const router = Router()

// auth route
router.route("/register").post(RegisterUser);
router.route("/login").post(LoginUser);
router.route("/logout").get(verifyJWT,LogoutUser);
router.route("/verifyJWT").get(verifyJWT,SendUserId);
router.route("/searchBar").get(SearchBar);


router.route("/sent-otp").post(SentOTP);

router.route("/patient-dashboard/:id").get(verifyJWT,PatientProfile);
// Patient Route
router.route("/Patientprofile").get(verifyJWT,PatientProfile);
router.route("/save-profile").post(verifyJWT,SavePatientData);

// Doctor Route
router.route("/Doctorprofile").get(verifyJWT,DoctorProfile);
router.route("/save-doctor-profile").post(verifyJWT,SaveDoctorProfile);
router.route("/save-profile-photo").post(upload.single('profilepic'),verifyJWT,saveProfilePhoto);

// search by Query Route

router.route("/Fetch-Doctors-On-Query").post(verifyJWT, FetchDoctorBasedOnQuery)
router.route("/Fetch-Doctor-Based-On-Id/:id").get(verifyJWT, FetchDoctorBasedOnId)
router.route("/Book-Appointment/:id").post(verifyJWT, BookAppointment)

// notification

router.route("/fetch-all-notifications-for-patient/:id").get(verifyJWT,notificationForPatient)
router.route("/fetch-all-notifications-for-doctor/:id").get(verifyJWT,notificationForDoctor)

// appointment Details

router.route("/appointment-details").get(verifyJWT,appointmentDetails)
router.route("/update-appointment-status/:id").post(verifyJWT,updateAppointmentStatus)
export default router