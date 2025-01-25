import axios from "axios"

const API_URL = "http://localhost:4000"

export const loginAPI = (data)=>{
    return axios.post(`${API_URL}/api/v1/users/login`, data, { withCredentials: true })
}

export const registerAPI = (data)=>{
    console.log(typeof(data))
    return axios.post(`${API_URL}/api/v1/users/register`, data)
}

export const PatientDashboardAPI = (id)=>{
    return axios.get(`${API_URL}/api/v1/users/patient-dashboard/:${id}`,{withCredentials:true})
}

export const logoutAPI = ()=>{
    return axios.get(`${API_URL}/api/v1/users/logout`, { withCredentials: true })
}

export const PatientProfile = ()=>{
    return axios.get(`${API_URL}/api/v1/users/Patientprofile`, {withCredentials: true})
}

export const SaveDataAPI = (data)=>{
    return axios.post(`${API_URL}/api/v1/users/save-profile`, data, {withCredentials: true})
}

export const SaveDoctorProfile = (data) =>{
    return axios.post(`${API_URL}/api/v1/users/save-doctor-profile`, data, {withCredentials: true})
}

export const SaveProfilePhotoAPI = (data)=>{
    return axios.post(`${API_URL}/api/v1/users/save-profile-photo`, data, {withCredentials: true})
}
export const SentOTPAPI = (data)=>{
    return axios.post(`${API_URL}/api/v1/users/sent-otp`, data, {withCredentials: true})
}

export const IsverifyJWTAPI = ()=>{
    return axios.get(`${API_URL}/api/v1/users/verifyJWT`, { withCredentials: true })
}
