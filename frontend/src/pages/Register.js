import { useState } from "react";
import { FirstDivClass } from "../utilities/className";
import { CardDivClass } from "../utilities/className";
import { Button } from "../utilities/Button";
import { isValidPhoneOrEmail } from "../utilities/Validation"; // Import utility

const Register = () => {
  const [selectedRole, setSelectedRole] = useState("Select Role");
  const [showRole, setShowRole] = useState(false);
  const [phoneOrEmailValue, setPhoneOrEmailValue] = useState("");
  const [emailOrPhoneError, setEmailOrPhoneError] = useState("");
  const [isPhoneOrEmailValid, setIsPhoneOrEmailValid] = useState(true); // Tracks validity

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordMatch, setIsPasswordMatch] = useState(true); // Tracks password match

  // Role options
  const roles = ["Admin", "Doctor", "Patient"];

  // Handle role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowRole(false); // Close dropdown after selection
  };

  // Handle email or phone validation
  const handlePhoneOrEmailChange = (value) => {
    setPhoneOrEmailValue(value);
    const result = isValidPhoneOrEmail(value);
    setIsPhoneOrEmailValid(result.isValid);
    setEmailOrPhoneError(result.error);
  };

  // Handle password matching
  const handlePasswordChange = (value) => {
    setPassword(value);
    setIsPasswordMatch(value === confirmPassword); // Check match on password change
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    setIsPasswordMatch(value === password); // Check match on confirmPassword change
  };

  return (
    <div className={FirstDivClass}>
      <div className={CardDivClass}>
        <h1 className="text-blue-950 text-center font-semibold text-2xl my-4">
          Join Us at HealthConnect
        </h1>
        <div className="flex-col justify-between items-center w-full space-y-4">
          {/* Input for Phone or Email */}
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

          {/* Input for Password */}
          <div className="flex flex-col">
            <input
              type="password"
              value={password}
              placeholder="Password"
              className="placeholder-blue-900 rounded-sm ring-1 ring-slate-700 bg-transparent text-black px-3 py-2 w-full"
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
          </div>

          {/* Input for Confirm Password */}
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

          {/* Dropdown for Role Selection */}
          <div className="flex justify-center items-center relative w-full">
            <button
              className="w-full flex justify-between items-center px-3 py-2 bg-white ring-1 ring-slate-700 rounded-sm text-black focus:outline-none"
              onClick={() => setShowRole(!showRole)}
            >
              {selectedRole}
            </button>
            {showRole && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                {roles.map((role) => (
                  <button
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

          {/* Register Button */}
          <Button name="Register" />
        </div>
      </div>
    </div>
  );
};

export { Register };
