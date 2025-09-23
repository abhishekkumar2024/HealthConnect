import axios from "axios"

const API_URL = "http://localhost:4000"

const fetchallNotifications = (id) =>{
    return axios.get(`${API_URL}/api/v1/users/fetch-all-notifications-for-patient/${id}`, {withCredentials: true});
}
export { fetchallNotifications }