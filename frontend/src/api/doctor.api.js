import axios from "axios"

const API_URL = "http://localhost:4000"

export const DoctorProfile = ()=>{
    return axios.get(`${API_URL}/api/v1/users/Doctorprofile`, {withCredentials: true})
}

export const fetchDoctorsBasedOnFilter = (filter) => {
    return axios.post(`${API_URL}/api/v1/users/Fetch-Doctors-On-Query`, filter, {withCredentials: true});
}

export const FetchDoctorBasedOnId = (id) => {
    return axios.get(`${API_URL}/api/v1/users/Fetch-Doctor-Based-On-Id/${id}`, {withCredentials: true});
}

export const BookAppointment = (data) => {
    return axios.post(`${API_URL}/api/v1/users/Book-Appointment/${data.id}`, data, {withCredentials: true});
}