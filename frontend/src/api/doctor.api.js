import axios from "axios"

const API_URL = "http://localhost:4000"

export const DoctorProfile = ()=>{
    return axios.get(`${API_URL}/api/v1/users/Doctorprofile`, {withCredentials: true})
}