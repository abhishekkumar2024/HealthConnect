import axios from "axios"

const API_URL = "http://localhost:4000"


export const fetchallAppointments = () => {
    return axios.get(`${API_URL}/api/v1/users/appointment-details`, {withCredentials: true});
}