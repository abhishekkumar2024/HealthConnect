import {
    User,
    Shield,
    Activity,
    Edit2,
    Save,
    X,
    Loader2,
    MapPin,
    Phone,
    Mail,
    Award,
    CreditCard,
    Camera,
    File
} from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Alert,
    AlertDescription,
} from "../utils/cards/Card.js";
import { useDarkMode } from "../contextAPI/contextApi.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditableFieldDoctor } from "../utils/CommonFunctionlities/commonFunctions.js";
import { validateFields } from "../utils/Validation.js";
import { DoctorProfile } from "../api/doctor.api.js";
import { SaveDoctorProfile,SaveProfilePhotoAPI } from "../api/auth.api.js";

const DoctorProfileDetails = () => {
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const { themeStyles } = useDarkMode();
    const fileInputRef = useRef()

    const [doctorData, setDoctorData] = useState({
        name: "",
        rating: [],
        email: "",
        phone: "",
        street: "",
        landmark: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        specialization: "",
        experience: "",
        qualification: "",
        license: "",
        consultationFee: "",
        averageRating: "",
        role: "",
        profilepic: ""
    });

    const FetchDoctorDetails = useCallback(async () => {
        try {
            const response = await DoctorProfile();
            if (response?.status === 200 && response?.data?.data?.DoctorDetails) {
                const details = response.data.data.DoctorDetails;
                setDoctorData({
                    ...details,
                    street: details.address?.street || "",
                    landmark: details.address?.landmark || "",
                    city: details.address?.city || "",
                    state: details.address?.state || "",
                    country: details.address?.country || "",
                    pincode: details.address?.pincode || "",
                    name: details.name || "",
                    phone: details.phone || "",
                    specialization: details.specialization || "",
                    experience: details.experience || "",
                    qualification: details.qualification || "",
                    license: details.license || "",
                    consultationFee: details.consultationFee || "",
                    averageRating: details.averageRating || "",
                    role: details.role || "",
                    rating: details.rating || [],
                    email: details.email || ""
                });
            }
        } catch (error) {
            setError("Failed to fetch doctor details");
            console.error("Error fetching doctor details:", error);
        }
    }, []);

    useEffect(() => {
        FetchDoctorDetails();
    }, [FetchDoctorDetails]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const dataToSave = {
                ...doctorData,
                address: {
                    street: doctorData.street || "",
                    landmark: doctorData.landmark || "",
                    city: doctorData.city || "",
                    state: doctorData.state || "",
                    country: doctorData.country || "",
                    pincode: doctorData.pincode || "",
                }
            };
            await SaveDoctorProfile(dataToSave);
            alert("Data saved successfully!");
            setIsEditing(false);
            setError("");
        } catch (err) {
            setError("Failed to save data.");
        } finally {
            setSaving(false);
        }
    };

    const handleFieldChange = (field, value) => {
        setDoctorData(prev => ({
            ...prev,
            [field.toLowerCase()]: value
        }));
    };

    const renderFields = () => {
        const sections = {
            personal: {
                title: "Personal Information",
                icon: User,
                fields: ["name", "email", "phone"]
            },
            professional: {
                title: "Professional Information",
                icon: Award,
                fields: ["specialization", "experience", "qualification", "license"]
            },
            practice: {
                title: "Practice Details",
                icon: CreditCard,
                fields: ["consultationFee", "role"]
            },
            address: {
                title: "Address Information",
                icon: MapPin,
                fields: ["street", "landmark", "city", "state", "country", "pincode"]
            }
        };

        return Object.entries(sections).map(([sectionKey, section]) => (
            <div key={sectionKey} className="mb-8 last:mb-0">
                <div className="flex items-center gap-2 mb-4">
                    <section.icon className={`h-5 w-5 ${themeStyles.text}`} />
                    <h3 className={`text-lg font-semibold ${themeStyles.text}`}>{section.title}</h3>
                </div>
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}>
                    {section.fields.map((field) => (
                        <EditableFieldDoctor
                            key={field}
                            label={field}
                            value={doctorData[field.toLowerCase()]}
                            onChange={(value) => handleFieldChange(field, value)}
                            isEditing={isEditing}
                            // error={validateFields({ field: doctorData[field.toLowerCase()] })}
                            doctorData={doctorData}
                        />
                    ))}
                </div>
            </div>
        ));
    };
    const handleProfilePictureClick = () => {
        fileInputRef.current?.click(); // This triggers the file input click
    };
    
    const handleProfilePictureChange = async (event) => {
        const file = event.target.files?.[0];
        console.log(file)
        if (!file) return;

        // console.log("break point1")
        if (file.size > 5 * 1024 * 1024) {
            setError("File size should be less than 5MB");
            return;
        }
        // console.log("break point2")
        try {
            setSaving(true);

            const formData = new FormData();
            formData.append('profilepic', file);
            // console.log("break point3")
            // Step 2: Send the file URL to your backend
            const response = await SaveProfilePhotoAPI(formData);
            console.log(response)
            // console.log(response.data.mesa.DoctorDetails);
    
            setDoctorData(prev => ({
                ...prev,
                profilepic: response.data.data.response.profilepic
            }));
    
            setError("");
        } catch (err) {
            console.error('Upload error:', err);
            setError("Failed to upload profile picture");
        } finally {
            setSaving(false);
        }
    };
    
    return (
        <div className={`${themeStyles.background} min-h-screen p-8`}>
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card className="mb-8">
                <CardHeader className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className={`${themeStyles.accentBg} p-6 rounded-full`}>
                            <div
                                className={`${themeStyles.accentBg} p-6 rounded-full relative cursor-pointer group`}
                                onClick={handleProfilePictureClick}
                            >
                                {doctorData.profilepic ? (
                                    <img
                                        src={doctorData.profilepic}
                                        alt="Profile"
                                        className="h-16 w-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <User className={`h-16 w-16 ${themeStyles.accentText}`} />
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-6 w-6 text-white" />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleProfilePictureChange}
                                />
                            </div>
                        </div>
                        <div>
                            <CardTitle className="text-3xl mb-2">
                                {doctorData.name || "Unnamed Doctor"}
                            </CardTitle>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                <span className={`${themeStyles.subtext} flex items-center gap-1`}>
                                    <Shield className="h-4 w-4" />
                                    <span className="font-medium">License:</span> {doctorData.license || "N/A"}
                                </span>
                                <span className={`${themeStyles.subtext} flex items-center gap-1`}>
                                    <Activity className="h-4 w-4" />
                                    {doctorData.specialization || "Unspecified"}
                                </span>
                                {doctorData.experience && (
                                    <span className={`${themeStyles.subtext} flex items-center gap-1`}>
                                        <Award className="h-4 w-4" />
                                        {doctorData.experience} years experience
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className={`${themeStyles.buttonBg} ${themeStyles.buttonHoverBg} text-white px-4 py-2 rounded-lg flex items-center gap-2`}
                        >
                            <Edit2 className="h-4 w-4" /> Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
                            >
                                <X className="h-4 w-4" /> Cancel
                            </button>
                        </div>
                    )}
                </CardHeader>
            </Card>

            <Card>
                <CardContent className="py-6">
                    {renderFields()}
                </CardContent>
            </Card>
        </div>
    );
};

export { DoctorProfileDetails };