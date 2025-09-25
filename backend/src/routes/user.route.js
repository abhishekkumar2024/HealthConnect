import { Router } from "express";
import { 
  LoginUser, 
  RegisterUser, 
  LogoutUser, 
  SentOTP, 
  SendUserId ,
  GetProfile,
  UpdateProfile
} from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middlleware.js";
import { 
  PatientProfile, 
  SavePatientData 
} from "../controller/patient.controller.js";

import {searchUsers} from "../controller/search.controller.js"

import { upload } from "../middleware/multer.middleware.js";

const router = Router();

//////////////////////////
// User Authentication Routes
//////////////////////////
router.post("/register", RegisterUser);            // Register a new user
router.post("/login", LoginUser);                  // Login
router.get("/logout", verifyJWT, LogoutUser);      // Logout
router.post("/sent-otp", SentOTP);                 // Send OTP
router.get("/verifyJWT", verifyJWT, SendUserId);   // Verify JWT and get user info

//////////////////////////
// Patient Routes
//////////////////////////
router.get("/patient-dashboard/:id", verifyJWT, LoginUser); // Patient dashboard
router.get("/Patientprofile", verifyJWT, PatientProfile);   // Get patient profile
router.post("/save-profile", verifyJWT, SavePatientData);   // Save/update patient profile

//////////////////////////
// Doctor Routes
//////////////////////////
router.get("/profile/:id", verifyJWT, GetProfile); 
router.post("/profile/:id", verifyJWT, upload.single('profilepic'), UpdateProfile);
// Get doctor profile
//////////////////////////
// Search Implementation
//////////////////////////

router.get("/search", verifyJWT, searchUsers)
export default router;
