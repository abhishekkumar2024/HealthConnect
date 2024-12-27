import axios from "axios"

const API_URL = "http://localhost:4000"

export const loginAPI = (email, password)=>{
    return axios.post(`${API_URL}/api/v1/users/login`,{email,password})
}

export const registerAPI = (data)=>{
    console.log(typeof(data))
    return axios.post(`${API_URL}/api/v1/users/register`, data)
}