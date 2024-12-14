import { useState } from "react";
import { FirstDivClass } from "../utilities/className";
import { CardDivClass } from "../utilities/className";
import { Button } from "../utilities/Button";

const Register = () => {
    const [selectedRole, setSelectedRole] = useState("Select Role");
    const [showRole, setShowRole] = useState(false);

    const roles = ["Admin", "Doctor", "Patient"];

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setShowRole(false); // Close dropdown after selection
    };

    return (
        <div className={FirstDivClass}>
            <div className={CardDivClass}>
                <h1 className="text-blue-950 text-center font-semibold text-2xl my-4">
                    Join Us at HealthConnect
                </h1>
                <div className="flex-col justify-between items-center w-full space-y-4">
                    <div className="flex justify-center items-center">
                        <input
                            type="text"
                            placeholder="Phone Number or Email ID"
                            className="placeholder-blue-900 rounded-sm ring-1 ring-slate-700 bg-transparent text-black px-3 py-2 w-full"
                        />
                    </div>
                    <div className="flex justify-center items-center">
                        <input
                            type="password"
                            placeholder="Password"
                            className="placeholder-blue-900 rounded-sm ring-1 ring-slate-700 bg-transparent text-black px-3 py-2 w-full"
                        />
                    </div>
                    <div className="flex justify-center items-center">
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className="placeholder-blue-900 rounded-sm ring-1 ring-slate-700 bg-transparent text-black px-3 py-2 w-full"
                        />
                    </div>
                    {/* Dropdown for role selection */}
                    <div className="flex justify-center items-center relative w-full">
                        <button
                            className="w-full flex justify-between items-center px-3 py-2 bg-white ring-1 ring-slate-700 rounded-sm text-black focus:outline-none"
                            onClick={() => setShowRole(!showRole)}
                        >
                            {selectedRole}
                            <svg
                                className="h-5 w-5 text-gray-600 ml-2"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
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
                    <Button name="Register" />
                </div>
            </div>
        </div>
    );
};

export { Register };
