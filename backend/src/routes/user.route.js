import { Router } from "express";
import { LoginUser, RegisterUser, LogoutUser } from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middlleware.js";
import { PatientDashboard } from "../controller/patient.controller.js";
import { SavePatientData } from "../controller/patient.controller.js";

const router = Router()

router.route("/register").post(RegisterUser);
router.route("/login").post(LoginUser);
router.route("/patient-dashboard/:id").get(verifyJWT,LoginUser);
router.route("/logout").get(verifyJWT,LogoutUser);
router.route("/profile").get(verifyJWT,PatientDashboard);
router.route("/save-profile").post(verifyJWT,SavePatientData);

export default router