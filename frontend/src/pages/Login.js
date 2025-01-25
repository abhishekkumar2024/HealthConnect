import { useState } from "react";
import { Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { validateFields } from "../utilities/Validation";
import { loginAPI } from "../api/auth.api.js";
import { useDarkMode } from "../contextAPI/contextApi";

const Login = () => {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true)
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();
  const { themeStyles } = useDarkMode();

  const handleValidation = (value) => {
    setEmail(value);
    const Result = validateFields({ email: value });
    console.log(Result)

    setIsValidEmail(Result);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    handleValidation(email)

    if (!isValidEmail) {
      alert("Please correct the format of Email ID");
      return;
    }
    if (!email || !password) {
      alert("Please fill all fields!");
      return;
    }
    // console.log(phoneOrEmailIdValue)
    try {
      const response = await loginAPI({
        email: email,
        password: password,
      });

      if (response.status === 200) {
        const details  = response.data.data.user;
        // console.log(response.data.data.user.role)
        const role = response.data.data.user.role;

        if (role === "Patient") {
          navigate(`/patient/${details._id}`);
        }
        else if (role === "Doctor") {
          navigate(`/Doctor-Dashboard/${details._id}`);
        }
        else if (role === "Admin") {
          navigate(`/admin-dashboard/${details._id}`);
        }
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };


  return (
    <div className={`min-h-screen ${themeStyles.background} flex items-center justify-center p-4 transition-colors duration-300`}>
      <div className={`${themeStyles.cardBg} backdrop-blur-lg rounded-2xl p-8 w-full max-w-md`}>

        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold ${themeStyles.text} mb-2`}>Welcome Back</h1>
          <p className={themeStyles.subtext}>Sign in to HealthConnect</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeStyles.iconColor}`} size={20} />
            <input
              type="text"
              value={email}
              placeholder="Email ID"
              className={`w-full ${themeStyles.inputBg} border ${themeStyles.borderColor} rounded-lg py-3 px-12 ${themeStyles.inputText} focus:outline-none ${themeStyles.inputBorder} ${themeStyles.text}`}
              onChange={(e) => handleValidation(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeStyles.iconColor}`} size={20} />
            <input
              type="password"
              value={password}
              placeholder="Password"
              className={`w-full ${themeStyles.inputBg} border ${themeStyles.borderColor} rounded-lg py-3 px-12 ${themeStyles.inputText} focus:outline-none ${themeStyles.inputBorder} ${themeStyles.text}`}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-400"
              />
              <span className={`${themeStyles.subtext} ml-2 text-sm`}>Remember Me</span>
            </label>
            <Link
              to="/forgot-password"
              className={`${themeStyles.subtext} ${themeStyles.linkHover} text-sm`}
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className={`w-full ${themeStyles.buttonBg} ${themeStyles.buttonHoverBg} text-white font-semibold py-3 rounded-lg transition duration-300`}
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className={themeStyles.subtext}>
            Don't have an account?{" "}
            <Link to="/register" className={`${themeStyles.linkHover} font-semibold`}>
              Sign Up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export { Login };
