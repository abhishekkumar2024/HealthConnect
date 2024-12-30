import React, { useState, useCallback, useEffect } from "react";
import {
  User,
  Calendar,
  Activity,
  FileText,
  Clock,
  Shield,
  Pill,
  AlertTriangle,
  Edit2,
  Save,
  X,
  Heart,
  Thermometer,
  Loader2,
  MapPin,
  Flag,
  Hash,
  Camera,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useDarkMode } from "../contextAPI/contextApi";
import {
  Card,
  StatCard,
  CardHeader,
  CardTitle,
  CardContent,
  Alert,
  AlertDescription,
} from "../utility/Cards.js";
import { SaveDataAPI, UserProfile } from "../api/auth.api.js";

const getPlaceholder = (field) => {
  const placeholders = {
    name: "Enter patient name",
    email: "Enter email address",
    phone: "Enter phone number",
    dateofbirth: "Select date of birth",
    gender: "Select gender",
    bloodgroup: "Select blood group",
    weight: "Enter weight in kg",
    height: "Enter height in cm",
    bmi: "BMI will be calculated",
    address: "Enter street address",
    city: "Enter city",
    state: "Enter state",
    country: "Enter country",
    pincode: "Enter PIN code",
    healthid: "Enter health ID",
    role: "User role",
  };
  return placeholders[field] || `Enter ${field}`;
};

const calculateBMI = (weight, height) => {
  const numWeight = parseFloat(weight);
  const numHeight = parseFloat(height);

  if (!numWeight || !numHeight) return "";
  const heightInMeters = numHeight / 100;
  const bmi = (numWeight / (heightInMeters * heightInMeters)).toFixed(1);
  return bmi;
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
      bloodgroup: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
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

const PatientProfileDetails = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const { themeStyles } = useDarkMode();

  const [patientData, setPatientData] = useState({
    name: "",
    email: "",
    phone: "",
    dateofbirth: "",
    gender: "",
    bloodgroup: "",
    weight: "",
    height: "",
    bmi: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    healthid: "",
    role: "",
    // isVerified: false,
    // isBlocked: false,
    // isDeleted: false,
    profilepic: "",
    medicalHistory: {
      conditions: [],
      allergies: [],
    },
    appointments: [],
  });

  const validateFields = () => {
    const errors = {};
    
    if (!patientData.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = "Invalid email format";
    }
    if (!patientData.name) errors.name = "Name is required";
    if (patientData.phone && !patientData.phone.match(/^\d{10}$/)) {
      errors.phone = "Invalid phone number format";
    }
    if (patientData.pincode && !String(patientData.pincode).match(/^\d{6}$/)) {
      errors.pincode = "Invalid PIN code format";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateFields()) return;
    setSaving(true);
    try {
      await SaveDataAPI(patientData);
      alert("Data saved successfully!");
      setIsEditing(false);
    } catch (err) {
      setError("Failed to save data.");
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setPatientData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await UserProfile();
        setPatientData({ ...patientData, ...response.data });
      } catch (err) {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className={`${themeStyles.background} min-h-screen p-8`}>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
  
      {/* Profile Header */}
      <Card className="mb-8">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className={`${themeStyles.accentBg} p-6 rounded-full`}>
              <User className={`h-16 w-16 ${themeStyles.accentText}`} />
            </div>
            <div>
              <CardTitle className="text-3xl mb-2">
                {patientData.name || "Unnamed Patient"}
              </CardTitle>
              <div className="flex gap-4">
                <span className={`${themeStyles.subtext} flex items-center gap-1`}>
                  <Shield className="h-4 w-4" /> ID: P-12345
                </span>
                <span className={`${themeStyles.subtext} flex items-center gap-1`}>
                  <Activity className="h-4 w-4" /> {patientData.bloodType || "Unknown"}
                </span>
              </div>
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className={`${themeStyles.buttonBg} ${themeStyles.buttonHoverBg} text-white px-4 py-2 rounded-lg flex items-center gap-2`}
            >
              <Edit2 className="h-4 w-4" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 
                  rounded-lg flex items-center gap-2 transition-colors duration-200 
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 
                  rounded-lg flex items-center gap-2 transition-colors duration-200`}
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          )}
        </CardHeader>
      </Card>
  
      {/* Navigation Tabs */}
      <div className="flex space-x-2 mb-6">
        {[
          { id: "personal", label: "Personal Info", icon: User },
          { id: "medical", label: "Medical History", icon: FileText },
          { id: "appointments", label: "Appointments", icon: Calendar },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
              activeTab === id
                ? `${themeStyles.accentBg} ${themeStyles.accentText}`
                : `${themeStyles.cardHoverBg} ${themeStyles.text} hover:${themeStyles.cardBg}`
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
  
      {/* Tab Content */}
      <Card>
        <CardContent className="py-6">
          {activeTab === "personal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(patientData)
                .filter(([key]) => !["medicalHistory", "appointments", "profilepic"].includes(key))
                .map(([field, value]) => (
                  <EditableField
                    key={field}
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={value}
                    onChange={handleFieldChange}
                    isEditing={isEditing}
                    error={validationErrors[field]}
                    patientData={patientData}
                  />
                ))}
            </div>
          )}
          {/* Medical and Appointments tabs remain the same */}
        </CardContent>
      </Card>
    </div>
  );
};

export { PatientProfileDetails };
