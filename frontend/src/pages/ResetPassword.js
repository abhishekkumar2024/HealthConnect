import { useState } from "react";
import { FirstDivClass, CardDivClass } from "../utilities/className";
import { Button } from "../utilities/Button";
import { isValidPhoneOrEmail } from "../utilities/Validation";

const ResetPassword = () => {
    const [OTPFlag, setOTPFlag] = useState(false);
    const [OTP, setOTP] = useState('')
    const [phoneOrEmailValue, setPhoneOrEmailValue] = useState("");
    const [emailOrPhoneError, setEmailOrPhoneError] = useState("");
    const [isPhoneOrEmailValid, setIsPhoneOrEmailValid] = useState(true); // Tracks validity
    const handlePhoneOrEmailChange = (value) => {
        setPhoneOrEmailValue(value);
        const result = isValidPhoneOrEmail(value); 
        setIsPhoneOrEmailValid(result.isValid);
        setEmailOrPhoneError(result.error);
    };

    return (
        <div className={FirstDivClass}>
            <div className={CardDivClass}>
                <h1 className="text-blue-950 text-center font-semibold text-2xl my-4">
                    Reset Your Password
                </h1>
                {!OTPFlag ? (
                    <div className="flex-col justify-between items-center w-full space-y-4">
                        <div className="flex justify-center items-center">
                            <input
                                type="text"
                                placeholder="Phone or Email ID"
                                value={phoneOrEmailValue}
                                aria-label="Enter your phone number or email ID"
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
                                onChange={(e) => { handlePhoneOrEmailChange(e.target.value) }}
                            />
                        </div>
                        {
                            (!isPhoneOrEmailValid) &&
                            (<p className="text-red-500 text-sm mt-1">{emailOrPhoneError}</p>)
                        }
                        <Button name="Verify" onClick={() => setOTPFlag(true)} />
                    </div>
                ) : (
                    <div className="flex-col justify-between items-center w-full space-y-4">
                        <div className="flex justify-center items-center">
                            <input
                                type="text"
                                placeholder="Enter OTP"
                                aria-label="Enter the OTP"
                                value={OTP}
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
                                onChange={(e) => { setOTP(e.target.value) }}
                            />
                        </div>
                        <Button name="Submit" />
                    </div>
                )}
            </div>
        </div>
    );
};

export { ResetPassword };
