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

export const UserProfile = ()=>{
    return axios.get(`${API_URL}/api/v1/users/profile`, {withCredentials: true})
}

export const SaveDataAPI = (data)=>{
    return axios.post(`${API_URL}/api/v1/users/save-profile`, data, {withCredentials: true})
}

