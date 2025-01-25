import React from "react";
import { useDarkMode } from "../../contextAPI/contextApi.js";
import { placeholders } from "../Variables.js";

const getPlaceholder = (field) => {
    return placeholders[field] || `Enter ${field}`;
  };

const EditableField = ({
  label,
  value,
  onChange,
  isEditing,
  type = "text",
  error = "",
  patientData = null,
  options = [],
}) => {
  const { themeStyles } = useDarkMode();
  const displayValue = value || "-";

  if (!isEditing) {
    return (
      <div className={`${themeStyles.cardBg} p-4 rounded-lg`}>
        <p className={`text-sm ${themeStyles.subtext} mb-1`}>{label}</p>
        <p className={`font-medium ${themeStyles.text} ${!value ? "opacity-50" : ""}`}>
          {label === "isVerified" || label === "isBlocked" || label === "isDeleted" ?
            (value ? "Yes" : "No") : displayValue}
        </p>
      </div>
    );
  }

  const isSelect = ["gender", "bloodgroup", "role"].includes(label.toLowerCase());
  const isDate = label.toLowerCase() === "dateofbirth";
  const isBoolean = ["isverified", "isblocked", "isdeleted"].includes(label.toLowerCase());

  if (isSelect) {
    const selectOptions = {
      gender: ["male", "female", "other"],
      bloodgroup: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],  // Match the enum from schema
      role: ["patient", "doctor", "admin"],
    }[label.toLowerCase()];

    return (
      <div className={`${themeStyles.cardBg} p-4 rounded-lg`}>
        <p className={`text-sm ${themeStyles.subtext} mb-1`}>{label}</p>
        <select
          value={value || ""}
          onChange={(e) => onChange(label.toLowerCase(), e.target.value)}
          className={`w-full p-2 rounded-md ${themeStyles.inputBg} ${themeStyles.text} 
            border ${themeStyles.inputBorder} ${error ? "border-red-500" : ""}`}
        >
          <option value="">Select {label}</option>
          {selectOptions.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }

  if (isDate) {
    return (
      <div className={`${themeStyles.cardBg} p-4 rounded-lg`}>
        <p className={`text-sm ${themeStyles.subtext} mb-1`}>{label}</p>
        <input
          type="date"
          value={value ? new Date(value).toISOString().split('T')[0] : ""}
          onChange={(e) => onChange(label.toLowerCase(), e.target.value)}
          className={`w-full p-2 rounded-md ${themeStyles.inputBg} ${themeStyles.text} 
            border ${themeStyles.inputBorder} ${error ? "border-red-500" : ""}`}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }

  if (isBoolean) {
    return (
      <div className={`${themeStyles.cardBg} p-4 rounded-lg`}>
        <p className={`text-sm ${themeStyles.subtext} mb-1`}>{label}</p>
        <select
          value={value.toString()}
          onChange={(e) => onChange(label.toLowerCase(), e.target.value === "true")}
          className={`w-full p-2 rounded-md ${themeStyles.inputBg} ${themeStyles.text} 
            border ${themeStyles.inputBorder} ${error ? "border-red-500" : ""}`}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`${themeStyles.cardBg} p-4 rounded-lg`}>
      <p className={`text-sm ${themeStyles.subtext} mb-1`}>{label}</p>
      <input
        type={["weight", "height", "pincode"].includes(label.toLowerCase()) ? "number" : type}
        value={value || ""}
        onChange={(e) => {
          const newValue = e.target.value;
          onChange(label.toLowerCase(), newValue);

          if (["weight", "height"].includes(label.toLowerCase())) {
            const weight = label.toLowerCase() === "weight" ? newValue : patientData?.weight;
            const height = label.toLowerCase() === "height" ? newValue : patientData?.height;
            const bmi = calculateBMI(weight, height);
            if (bmi) onChange("bmi", bmi);
          }
        }}
        placeholder={getPlaceholder(label.toLowerCase())}
        className={`w-full p-2 rounded-md ${themeStyles.inputBg} ${themeStyles.text} 
          border ${themeStyles.inputBorder} placeholder:${themeStyles.inputText} 
          ${error ? "border-red-500" : ""}`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

const EditableFieldDoctor = ({
  label,
  value,
  onChange,
  isEditing,
  error = "",
  doctorData = null,
}) => {
  const { themeStyles } = useDarkMode();
  const displayValue = value || "-";

  if (!isEditing) {
    return (
      <div className={`${themeStyles.cardBg} p-4 rounded-lg`}>
        <p className={`text-sm ${themeStyles.subtext} mb-1`}>{label}</p>
        <p className={`font-medium ${themeStyles.text} ${!value ? "opacity-50" : ""}`}>
          {label.toLowerCase() === "consultationfee" ? `₹${displayValue}` : displayValue}
        </p>
      </div>
    );
  }

  const isSelect = ["specialization", "role"].includes(label.toLowerCase());
  const isNumber = ["experience", "consultationfee", "pincode"].includes(label.toLowerCase());
  const isReadOnly = ["email", "role"].includes(label.toLowerCase());

  if (isSelect) {
    const selectOptions = {
      specialization: [
        "General Medicine",
        "Cardiology",
        "Dermatology",
        "Pediatrics",
        "Orthopedics",
        "Neurology",
        "Psychiatry",
        "Gynecology",
        "Ophthalmology",
        "ENT",
        "Dentistry",
        "Other"
      ],
      role: ["doctor"]
    }[label.toLowerCase()];

    return (
      <div className={`${themeStyles.cardBg} p-4 rounded-lg`}>
        <p className={`text-sm ${themeStyles.subtext} mb-1`}>{label}</p>
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={isReadOnly}
          className={`w-full p-2 rounded-md ${themeStyles.inputBg} ${themeStyles.text} 
            border ${themeStyles.inputBorder} ${error ? "border-red-500" : ""}
            ${isReadOnly ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <option value="">Select {label}</option>
          {selectOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }

  const getPlaceholder = (fieldName) => {
    const placeholders = {
      name: "Enter full name",
      phone: "Enter phone number",
      email: "Enter email address",
      experience: "Years of experience",
      qualification: "Enter qualifications (e.g., MBBS, MD)",
      license: "Enter medical license number",
      consultationFee: "Enter consultation fee",
      street: "Enter street address",
      landmark: "Enter nearest landmark",
      city: "Enter city",
      state: "Enter state",
      country: "Enter country",
      pincode: "Enter pincode"
    };
    return placeholders[fieldName.toLowerCase()] || `Enter ${fieldName}`;
  };

  return (
    <div className={`${themeStyles.cardBg} p-4 rounded-lg`}>
      <p className={`text-sm ${themeStyles.subtext} mb-1`}>{label}</p>
      <input
        type={isNumber ? "number" : "text"}
        value={value || ""}
        onChange={(e) => {
          let newValue = e.target.value;
          
          // Field-specific validations
          if (label.toLowerCase() === "phone") {
            newValue = newValue.replace(/[^0-9]/g, "").slice(0, 10);
          }
          if (label.toLowerCase() === "experience") {
            newValue = Math.max(0, parseInt(newValue) || 0).toString();
          }
          if (label.toLowerCase() === "consultationfee") {
            newValue = Math.max(0, parseInt(newValue) || 0).toString();
          }
          
          onChange(newValue);
        }}
        disabled={isReadOnly}
        placeholder={getPlaceholder(label)}
        className={`w-full p-2 rounded-md ${themeStyles.inputBg} ${themeStyles.text} 
          border ${themeStyles.inputBorder} placeholder:${themeStyles.inputText} 
          ${error ? "border-red-500" : ""}
          ${isReadOnly ? "opacity-50 cursor-not-allowed" : ""}`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

const calculateBMI = (weight, height) => {
  const numWeight = parseFloat(weight);
  const numHeight = parseFloat(height);

  if (!numWeight || !numHeight) return "";
  const heightInMeters = numHeight / 100;
  const bmi = (numWeight / (heightInMeters * heightInMeters)).toFixed(1);
  return bmi;
};

export { EditableField, calculateBMI, EditableFieldDoctor }