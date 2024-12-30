import React from 'react';
import { logoutAPI } from "../api/auth.api";
import { useNavigate } from "react-router-dom";
const logout = async()=>{
    try {
        
        const navigate = useNavigate();

        const response = await logoutAPI();
        if (response.status === 200) {
            alert("Logout successful");
            navigate("/login");
        } else {
            alert(response.data.message);
        }
    } catch (error) {
        alert(error.response?.data?.message || "Logout failed");
    }
}
export { logout }