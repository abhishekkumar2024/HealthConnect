import { useState } from "react";
import { Mail, Lock, User } from 'lucide-react';
import { useNavigate, Link } from "react-router-dom";
import { isValidPhoneOrEmail } from "../utilities/Validation";
import { registerAPI } from "../api/auth.api.js";
import { useDarkMode } from "../contextAPI/contextApi";

const Register = () => {
  const [selectedRole, setSelectedRole] = useState("Select Role");
  const [showRole, setShowRole] = useState(false);
  const [phoneOrEmailValue, setPhoneOrEmailValue] = useState("");
  const [emailOrPhoneError, setEmailOrPhoneError] = useState("");
  const [isPhoneOrEmailValid, setIsPhoneOrEmailValid] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);

  const navigate = useNavigate();
  const roles = ["Admin", "Doctor", "Patient"];
  const { themeStyles } = useDarkMode();

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
      alert("Please fill all fields correctly!");
      return;
    }

    try {
      const response = await registerAPI({
        phoneOrEmail: phoneOrEmailValue,
        password: password,
        role: selectedRole
      });

      alert(response.data.message);
      if (response.status === 201) {
        navigate('/login');
      }
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className={`min-h-screen ${themeStyles.background} flex items-center justify-center p-4 transition-colors duration-300`}>
      <div className={`${themeStyles.cardBg} backdrop-blur-lg rounded-2xl p-8 w-full max-w-md`}>
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold ${themeStyles.text} mb-2`}>Create Account</h1>
          <p className={themeStyles.subtext}>Join HealthConnect today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeStyles.iconColor}`} size={20} />
            <input
              type="text"
              value={phoneOrEmailValue}
              placeholder="Phone Number or Email ID"
              className={`w-full ${themeStyles.inputBg} border ${themeStyles.borderColor} rounded-lg py-3 px-12 ${themeStyles.inputText} focus:outline-none ${themeStyles.inputBorder}`}
              onChange={(e) => handlePhoneOrEmailChange(e.target.value)}
            />
            {!isPhoneOrEmailValid && phoneOrEmailValue && (
              <p className="text-red-400 text-sm mt-1">{emailOrPhoneError}</p>
            )}
          </div>

          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeStyles.iconColor}`} size={20} />
            <input
              type="password"
              value={password}
              placeholder="Password"
              className={`w-full ${themeStyles.inputBg} border ${themeStyles.borderColor} rounded-lg py-3 px-12 ${themeStyles.inputText} focus:outline-none ${themeStyles.inputBorder}`}
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeStyles.iconColor}`} size={20} />
            <input
              type="password"
              value={confirmPassword}
              placeholder="Confirm Password"
              className={`w-full ${themeStyles.inputBg} border ${themeStyles.borderColor} rounded-lg py-3 px-12 ${themeStyles.inputText} focus:outline-none ${themeStyles.inputBorder}`}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            />
            {!isPasswordMatch && confirmPassword && (
              <p className="text-red-400 text-sm mt-1">Passwords do not match</p>
            )}
          </div>

          <div className="relative">
            <User className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeStyles.iconColor}`} size={20} />
            <button
              type="button"
              className={`w-full ${themeStyles.inputBg} border ${themeStyles.borderColor} rounded-lg py-3 px-12 ${themeStyles.inputText} text-left focus:outline-none ${themeStyles.inputBorder}`}
              onClick={() => setShowRole(!showRole)}
            >
              {selectedRole}
            </button>
            {showRole && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg z-10">
                {roles.map((role) => (
                  <button
                    type="button"
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 text-gray-700"
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`w-full ${themeStyles.buttonBg} ${themeStyles.buttonHoverBg} text-white font-semibold py-3 rounded-lg transition duration-300`}
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className={themeStyles.subtext}>
            Already have an account?{" "}
            <Link to="/login" className={`${themeStyles.linkHover} font-semibold`}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export { Register };
