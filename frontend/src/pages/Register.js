import { useState } from "react";
import { FirstDivClass } from "../utilities/className";
import { CardDivClass } from "../utilities/className";
import { Button } from "../utilities/Button";
import { isValidPhoneOrEmail } from "../utilities/Validation";
import { registerAPI } from "../api/auth.api.js";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [selectedRole, setSelectedRole] = useState("Select Role");
  const [showRole, setShowRole] = useState(false);
  const [phoneOrEmailValue, setPhoneOrEmailValue] = useState("");
  const [emailOrPhoneError, setEmailOrPhoneError] = useState("");
  const [isPhoneOrEmailValid, setIsPhoneOrEmailValid] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);

  const navigate = useNavigate()
  const roles = ["Admin", "Doctor", "Patient"];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowRole(false);
  };

  const handlePhoneOrEmailChange = (value) => {
    setPhoneOrEmailValue(value);
    const result = isValidPhoneOrEmail(value);
    setIsPhoneOrEmailValid(result.isValid);
    setEmailOrPhoneError(result.error);
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setIsPasswordMatch(value === confirmPassword);
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    setIsPasswordMatch(value === password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isPhoneOrEmailValid || !isPasswordMatch || selectedRole === "Select Role") {
      alert("please enter empty field! ")
      return;
    }

    const formData = {
      phoneOrEmail: phoneOrEmailValue,
      password: password,
      role: selectedRole
    };

    try {
      const response = await registerAPI(formData)
      console.log(response)
      alert(response.data.message)
      if (response.status === 201) {
        // Handle successful registration
        navigate('/login')
        console.log('Registration successful');

      } else {
        // Handle registration error
        console.error('Registration failed');

      }
    } catch (error) {
      alert(error.response.data.message)
      console.error('Error:', error);
    }
  };

  return (
    <div className={FirstDivClass}>
      <div className={CardDivClass}>
        <h1 className="text-blue-950 text-center font-semibold text-2xl my-4">
          Join Us at HealthConnect
        </h1>
        <form onSubmit={handleSubmit} className="flex-col justify-between items-center w-full space-y-4">
          <div className="flex flex-col">
            <input
              type="text"
              value={phoneOrEmailValue}
              placeholder="Phone Number or Email ID"
              className={`placeholder-blue-900 rounded-sm ring-1 bg-transparent text-black px-3 py-2 w-full ${
                isPhoneOrEmailValid ? "ring-slate-700" : "ring-red-500"
              }`}
              onChange={(e) => handlePhoneOrEmailChange(e.target.value)}
            />
            {!isPhoneOrEmailValid && (
              <p className="text-red-500 text-sm mt-1">{emailOrPhoneError}</p>
            )}
          </div>

          <div className="flex flex-col">
            <input
              type="password"
              value={password}
              placeholder="Password"
              className="placeholder-blue-900 rounded-sm ring-1 ring-slate-700 bg-transparent text-black px-3 py-2 w-full"
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <input
              type="password"
              value={confirmPassword}
              placeholder="Confirm Password"
              className={`placeholder-blue-900 rounded-sm ring-1 bg-transparent text-black px-3 py-2 w-full ${
                isPasswordMatch ? "ring-slate-700" : "ring-red-500"
              }`}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            />
            {!isPasswordMatch && (
              <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
            )}
          </div>

          <div className="flex justify-center items-center relative w-full">
            <button
              type="button"
              className="w-full flex justify-between items-center px-3 py-2 bg-white ring-1 ring-slate-700 rounded-sm text-black focus:outline-none"
              onClick={() => setShowRole(!showRole)}
            >
              {selectedRole}
            </button>
            {showRole && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                {roles.map((role) => (
                  <button
                    type="button"
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" name="Register" />
        </form>
      </div>
    </div>
  );
};

export { Register };