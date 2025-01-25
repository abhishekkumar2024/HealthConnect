import React, { useState, useCallback, useEffect } from "react";
import { User, Calendar, Activity, FileText, Clock, Shield, Pill, AlertTriangle, Edit2, Save, X, Heart, Thermometer, Loader2, MapPin, Flag, Hash, Camera, CheckCircle, XCircle, } from "lucide-react";
import { useDarkMode } from "../contextAPI/contextApi.js";
import { Card, StatCard, CardHeader, CardTitle, CardContent, Alert, AlertDescription, } from "../utilities/cards/Card.js";
import { PatientProfile, SaveDataAPI } from "../api/auth.api.js";
import { EditableField, calculateBMI} from "../utilities/CommonFunctionlities/commonFunctions.js";
import { validateFields } from "../utilities/Validation.js";
import { useParams } from "react-router-dom";

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
    healthid: "",
    // role: "",
    street: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    profilepic: "",
    medicalHistory: {
      conditions: [],
      allergies: [],
    },
    appointments: [],
  });

  const handleSave = async () => {
    if (! Object.keys(validateFields({...patientData.data})).length === 0) return;

    setSaving(true);

    try {
      const dataToSave = {
        ...patientData,
        address: {
          street: patientData.street,
          city: patientData.city,
          state: patientData.state,
          country: patientData.country,
          pincode: patientData.pincode,
        },
      };
      await SaveDataAPI(dataToSave);
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
  const fetchData = useCallback(
    async () => {
      setLoading(true);
      try {
        const response = await PatientProfile();
        // console.log('API Response:', response.data);
        console.log(response)
        const flattenedData = {
          healthid: response.data.data.user.healthid,
          name: response.data.data.user.name,
          email: response.data.data.user.email,
          phone: response.data.data.user.phone,
          dateofbirth: response.data.data.user.dataofbirth,
          gender: response.data.data.user.gender,
          bloodgroup: response.data.data.user.bloodgroup,
          weight: response.data.data.user.weight,
          height: response.data.data.user.height,
          bmi: response.data.data.user.bmi,
          bloodgroup: response.data.data.user.bloodgroup || "",  // Make sure this is explicitly set
          street: response.data.data.user.address?.street || "",
          city: response.data.data.address?.city || "",
          state: response.data.data.user.address?.state || "",
          country: response.data.data.user.address?.country || "",
          pincode: response.data.data.user.address?.pincode || "",
        };
        console.log('Flattened Data:', flattenedData);
        setPatientData({...flattenedData});
      } catch (err) {
        console.log(err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    },[saving,loading,isEditing]
  )
  useEffect(() => {
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
                  <Shield className="h-4 w-4" /> ID: {`P-${patientData.healthid || "0000"}`}
                </span>
                <span className={`${themeStyles.subtext} flex items-center gap-1`}>
                  <Activity className="h-4 w-4" /> {patientData.bloodgroup || "Unknown"}
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${activeTab === id
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
                .filter(([key]) => !["medicalHistory", "appointments", "profilepic", "healthid", "_id", "address","role","updatedat","IsBlocked","IsVerified",].includes(key))
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
