import { FirstDivClass, CardDivClass } from "../utilities/className";
import { Button } from "../utilities/Button";
import { Link } from "react-router-dom";
import { isValidPhoneOrEmail } from "../utilities/Validation";
import { useState } from "react";

const Login = ({ color = 'bg-blue-50', BackGroundCardColor = 'bg-blue-50' }) => {
  const [password, setPassword] = useState('')
  const [isValidPhoneOrEmailId, setIsPhoneOrEmailValid] = useState(false)
  const [phoneOrEmailIdValue, setPhoneOrEmailValue] = useState('')
  const [phoneOrEmailIdError, setEmailOrPhoneError] = useState('')
  const handleValidation= (value)=>{
    setPhoneOrEmailValue(value)
    const Result = isValidPhoneOrEmail(value)
    setEmailOrPhoneError(Result.error)
    setIsPhoneOrEmailValid(Result.isValid)
  }

  return (
    <div className={FirstDivClass}>
      <div className={CardDivClass}>
        <h1 className="text-blue-950 text-center font-semibold text-2xl my-4">
          Log in to HealthConnect
        </h1>
        <div className="flex-col justify-between items-center w-full space-y-4">
          <div className="flex justify-center items-center">
            <input
              type="text"
              value={ phoneOrEmailIdValue }
              placeholder="Phone or Email ID"
              className="
                placeholder-blue-900
                rounded-sm
                ring-1 
                ring-slate-700
                bg-transparent
                text-black
                px-3
                py-2
                w-full
              "
              onChange={(e)=>{ 
                handleValidation(e.target.value)
              }}
            />
          </div>
          {
            (!isValidPhoneOrEmailId) && 
            (<p className="text-red-500 text-sm mt-1">{phoneOrEmailIdError}</p>)
          }
          <div className="flex justify-center items-center">
            <input
              type="password"
              placeholder="Password"
              value={ password }
              className="
                placeholder-blue-900
                rounded-sm
                ring-1 
                ring-slate-700
                bg-transparent
                text-black
                px-3
                py-2
                w-full
              "
              onChange={(e)=>{ setPassword(e.target.value)}}
            />
          </div>
          < Button name="Login" />
        </div>
        <div className="flex w-full justify-between items-center mt-6">
          <div className="flex items-center space-x-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-sm text-blue-950 ml-2">Remember Me</span>
            </label>
          </div>
          <div>
            <Link
              href="#"
              className="
              text-blue-600 
              hover:underline 
              hover:text-blue-800"
              to='/forgot-password'
            >
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Login };
