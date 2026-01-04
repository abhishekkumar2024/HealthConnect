import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { profileService } from '../services/profile.service.js';
import { User, Mail, Phone, MapPin, Camera, Save, Stethoscope, GraduationCap, Clock, DollarSign, Award, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
    },
    profilePicture: null,
    profilePicturePreview: '',
    // Doctor-specific fields
    specialization: '',
    licenseNumber: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    clinicAddress: {
      street: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
    },
    languages: [],
    bio: '',
    education: [],
    timeSlots: [],
    availability: true,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Backend route uses username parameter but controller uses req.user._id
      // So we can use any value, but let's use email or _id as fallback
      const identifier = user?.username || user?.email || user?._id || 'current';
      
      const response = await profileService.getProfile(identifier);
      
      // Backend returns: { success: true, data: { user, [role]: roleData } }
      const profileData = response.data?.user || response.data || {};
      const roleData = response.data?.[user?.role] || {};
      
      // Merge user and role data (role data takes precedence for overlapping fields)
      const profile = { ...profileData, ...roleData };
      
      // Debug log in development
      if (import.meta.env.DEV) {
        console.log('Profile data loaded:', { profileData, roleData, merged: profile });
      }
      
      const baseFormData = {
        name: profile.name || user?.name || '',
        email: profile.email || user?.email || '',
        phoneNumber: profile.phoneNumber || profile.phone || '',
        dateOfBirth: profile.dateOfBirth
          ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
          : '',
        gender: profile.gender || '',
        address: {
          street: profile.address?.street || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          country: profile.address?.country || '',
          pincode: profile.address?.pincode || profile.address?.pincode?.toString() || '',
        },
        profilePicture: null,
        profilePicturePreview: profile.profilePicture || '',
      };

      // Add doctor-specific fields if user is a doctor
      if (user?.role === 'doctor') {
        baseFormData.specialization = roleData?.specialization || '';
        baseFormData.licenseNumber = roleData?.licenseNumber || '';
        baseFormData.qualification = roleData?.qualification || '';
        baseFormData.experience = roleData?.experience || '';
        baseFormData.consultationFee = roleData?.consultationFee || '';
        baseFormData.clinicAddress = {
          street: roleData?.clinicAddress?.street || '',
          city: roleData?.clinicAddress?.city || '',
          state: roleData?.clinicAddress?.state || '',
          country: roleData?.clinicAddress?.country || '',
          pincode: roleData?.clinicAddress?.pincode || roleData?.clinicAddress?.pincode?.toString() || '',
        };
        baseFormData.languages = Array.isArray(roleData?.languages) ? [...roleData.languages] : [];
        baseFormData.bio = roleData?.bio || '';
        baseFormData.education = Array.isArray(roleData?.education) ? roleData.education.map(edu => ({ ...edu })) : [];
        baseFormData.timeSlots = Array.isArray(roleData?.timeSlots) ? roleData.timeSlots.map(slot => ({ ...slot })) : [];
        baseFormData.availability = roleData?.availability !== undefined ? roleData.availability : true;
      }
      
      setFormData(baseFormData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
      // Set basic data from user context if available
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      });
    } else if (name.startsWith('clinicAddress.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        clinicAddress: {
          ...formData.clinicAddress,
          [addressField]: value,
        },
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleLanguageAdd = () => {
    const input = document.getElementById('languageInput');
    const language = input?.value?.trim();
    if (language && !formData.languages.includes(language)) {
      setFormData({
        ...formData,
        languages: [...formData.languages, language],
      });
      input.value = '';
    }
  };

  const handleLanguageRemove = (language) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter(l => l !== language),
    });
  };

  const handleEducationAdd = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { degree: '', institution: '', year: '' }],
    });
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setFormData({
      ...formData,
      education: updatedEducation,
    });
  };

  const handleEducationRemove = (index) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index),
    });
  };

  const handleTimeSlotAdd = () => {
    setFormData({
      ...formData,
      timeSlots: [...formData.timeSlots, { day: 'monday', startTime: '', endTime: '', isAvailable: true }],
    });
  };

  const handleTimeSlotChange = (index, field, value) => {
    const updatedTimeSlots = [...formData.timeSlots];
    updatedTimeSlots[index] = { ...updatedTimeSlots[index], [field]: value };
    setFormData({
      ...formData,
      timeSlots: updatedTimeSlots,
    });
  };

  const handleTimeSlotRemove = (index) => {
    setFormData({
      ...formData,
      timeSlots: formData.timeSlots.filter((_, i) => i !== index),
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        profilePicture: file,
        profilePicturePreview: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const identifier = user?.username || user?.email || user?._id || 'current';
      
      // Build update data - handle address as nested object
      const updateData = {
        name: formData.name,
        phoneNumber: formData.phoneNumber || null,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        profilePicture: formData.profilePicture,
      };
      
      // Add address fields individually for FormData
      // Express body-parser should parse address[street] as req.body.address.street
      // Send all address fields (including empty) so they can be updated/cleared
      updateData['address[street]'] = formData.address.street || '';
      updateData['address[city]'] = formData.address.city || '';
      updateData['address[state]'] = formData.address.state || '';
      updateData['address[country]'] = formData.address.country || '';
      updateData['address[pincode]'] = formData.address.pincode || '';

      // Add doctor-specific fields if user is a doctor
      if (user?.role === 'doctor') {
        updateData.specialization = formData.specialization || null;
        updateData.licenseNumber = formData.licenseNumber || null;
        updateData.qualification = formData.qualification || null;
        updateData.experience = formData.experience ? parseInt(formData.experience) : null;
        updateData.consultationFee = formData.consultationFee ? parseFloat(formData.consultationFee) : null;
        updateData.bio = formData.bio || null;
        updateData.availability = formData.availability;
        
        // Clinic address
        updateData['clinicAddress[street]'] = formData.clinicAddress.street || '';
        updateData['clinicAddress[city]'] = formData.clinicAddress.city || '';
        updateData['clinicAddress[state]'] = formData.clinicAddress.state || '';
        updateData['clinicAddress[country]'] = formData.clinicAddress.country || '';
        updateData['clinicAddress[pincode]'] = formData.clinicAddress.pincode || '';
        
        // Languages array
        if (formData.languages.length > 0) {
          updateData.languages = JSON.stringify(formData.languages);
        }
        
        // Education array
        if (formData.education.length > 0) {
          updateData.education = JSON.stringify(formData.education.map(edu => ({
            degree: edu.degree,
            institution: edu.institution,
            year: edu.year ? parseInt(edu.year) : null,
          })));
        }
        
        // Time slots array
        if (formData.timeSlots.length > 0) {
          updateData.timeSlots = JSON.stringify(formData.timeSlots.map(slot => ({
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: slot.isAvailable !== false,
          })));
        }
      }
      console.log(`identifier: ${identifier}`);
      const response = await profileService.updateProfile(identifier, updateData);
      
      // Backend returns: { success: true, data: { user, [role]: roleData } }
      const updatedUserData = response.data?.user || response.data || {};
      
      // Debug log in development
      if (import.meta.env.DEV) {
        console.log('Profile update response:', response.data);
      }
      
      updateUser(updatedUserData);
      
      // Refresh profile data to show updated values
      await fetchProfile();
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.role === 'doctor' ? 'Doctor Profile' : 'My Profile'}
        </h1>
        <p className="text-gray-600 mt-2">
          {user?.role === 'doctor' ? 'Manage your professional information' : 'Manage your personal information'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            {formData.profilePicturePreview ? (
              <img
                src={formData.profilePicturePreview}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-primary-600" />
              </div>
            )}
            <label
              htmlFor="profilePicture"
              className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700"
            >
              <Camera className="w-4 h-4" />
            </label>
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div>
            <p className="font-medium text-gray-900">Profile Picture</p>
            <p className="text-sm text-gray-500">Click the camera icon to change</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="input-field"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              disabled
              className="input-field bg-gray-100"
              value={formData.email}
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              className="input-field"
              value={formData.phoneNumber || ''}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              className="input-field"
              value={formData.dateOfBirth || ''}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              className="input-field"
              value={formData.gender || ''}
              onChange={handleChange}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                className="input-field"
                value={formData.address.street || ''}
                onChange={handleChange}
                placeholder="Enter street address"
              />
            </div>
            <div>
              <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                className="input-field"
                value={formData.address.city || ''}
                onChange={handleChange}
                placeholder="Enter city"
              />
            </div>
            <div>
              <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                id="address.state"
                name="address.state"
                className="input-field"
                value={formData.address.state || ''}
                onChange={handleChange}
                placeholder="Enter state"
              />
            </div>
            <div>
              <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                id="address.country"
                name="address.country"
                className="input-field"
                value={formData.address.country || ''}
                onChange={handleChange}
                placeholder="Enter country"
              />
            </div>
            <div>
              <label htmlFor="address.pincode" className="block text-sm font-medium text-gray-700 mb-2">
                Pincode
              </label>
              <input
                type="text"
                id="address.pincode"
                name="address.pincode"
                className="input-field"
                value={formData.address.pincode || ''}
                onChange={handleChange}
                placeholder="Enter pincode"
              />
            </div>
          </div>
        </div>

        {/* Doctor-Specific Fields */}
        {user?.role === 'doctor' && (
          <>
            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Stethoscope className="w-5 h-5 mr-2" />
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    required
                    className="input-field"
                    value={formData.specialization || ''}
                    onChange={handleChange}
                    placeholder="e.g., Cardiology, Pediatrics"
                  />
                </div>
                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    required
                    className="input-field"
                    value={formData.licenseNumber || ''}
                    onChange={handleChange}
                    placeholder="Enter license number"
                  />
                </div>
                <div>
                  <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-2">
                    <GraduationCap className="w-4 h-4 inline mr-2" />
                    Qualification
                  </label>
                  <input
                    type="text"
                    id="qualification"
                    name="qualification"
                    className="input-field"
                    value={formData.qualification || ''}
                    onChange={handleChange}
                    placeholder="e.g., MBBS, MD"
                  />
                </div>
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    id="experience"
                    name="experience"
                    min="0"
                    max="60"
                    className="input-field"
                    value={formData.experience || ''}
                    onChange={handleChange}
                    placeholder="Years of experience"
                  />
                </div>
                <div>
                  <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Consultation Fee (₹)
                  </label>
                  <input
                    type="number"
                    id="consultationFee"
                    name="consultationFee"
                    min="0"
                    className="input-field"
                    value={formData.consultationFee || ''}
                    onChange={handleChange}
                    placeholder="Enter consultation fee"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="availability"
                    name="availability"
                    checked={formData.availability}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <label htmlFor="availability" className="ml-2 text-sm font-medium text-gray-700">
                    Available for appointments
                  </label>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows="4"
                maxLength="1000"
                className="input-field"
                value={formData.bio || ''}
                onChange={handleChange}
                placeholder="Tell patients about yourself..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio?.length || 0}/1000 characters
              </p>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages Spoken
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.languages.map((lang, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => handleLanguageRemove(lang)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="languageInput"
                  className="input-field flex-1"
                  placeholder="Add a language"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleLanguageAdd();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleLanguageAdd}
                  className="btn-secondary flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Education */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Education
              </h3>
              <div className="space-y-4">
                {formData.education.map((edu, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <input
                      type="text"
                      placeholder="Degree"
                      className="input-field"
                      value={edu.degree || ''}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Institution"
                      className="input-field"
                      value={edu.institution || ''}
                      onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Year"
                      className="input-field"
                      value={edu.year || ''}
                      onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => handleEducationRemove(index)}
                      className="btn-secondary text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 inline mr-1" />
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleEducationAdd}
                  className="btn-secondary flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Education</span>
                </button>
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Availability Schedule
              </h3>
              <div className="space-y-4">
                {formData.timeSlots.map((slot, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                    <select
                      className="input-field"
                      value={slot.day || 'monday'}
                      onChange={(e) => handleTimeSlotChange(index, 'day', e.target.value)}
                    >
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                      <option value="saturday">Saturday</option>
                      <option value="sunday">Sunday</option>
                    </select>
                    <input
                      type="time"
                      placeholder="Start Time"
                      className="input-field"
                      value={slot.startTime || ''}
                      onChange={(e) => handleTimeSlotChange(index, 'startTime', e.target.value)}
                    />
                    <input
                      type="time"
                      placeholder="End Time"
                      className="input-field"
                      value={slot.endTime || ''}
                      onChange={(e) => handleTimeSlotChange(index, 'endTime', e.target.value)}
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={slot.isAvailable !== false}
                        onChange={(e) => handleTimeSlotChange(index, 'isAvailable', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded mr-2"
                      />
                      Available
                    </label>
                    <button
                      type="button"
                      onClick={() => handleTimeSlotRemove(index)}
                      className="btn-secondary text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 inline mr-1" />
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleTimeSlotAdd}
                  className="btn-secondary flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Time Slot</span>
                </button>
              </div>
            </div>

            {/* Clinic Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Clinic Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="clinicAddress.street" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="clinicAddress.street"
                    name="clinicAddress.street"
                    className="input-field"
                    value={formData.clinicAddress.street || ''}
                    onChange={handleChange}
                    placeholder="Enter clinic street address"
                  />
                </div>
                <div>
                  <label htmlFor="clinicAddress.city" className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    id="clinicAddress.city"
                    name="clinicAddress.city"
                    className="input-field"
                    value={formData.clinicAddress.city || ''}
                    onChange={handleChange}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label htmlFor="clinicAddress.state" className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    id="clinicAddress.state"
                    name="clinicAddress.state"
                    className="input-field"
                    value={formData.clinicAddress.state || ''}
                    onChange={handleChange}
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <label htmlFor="clinicAddress.country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    id="clinicAddress.country"
                    name="clinicAddress.country"
                    className="input-field"
                    value={formData.clinicAddress.country || ''}
                    onChange={handleChange}
                    placeholder="Enter country"
                  />
                </div>
                <div>
                  <label htmlFor="clinicAddress.pincode" className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    id="clinicAddress.pincode"
                    name="clinicAddress.pincode"
                    className="input-field"
                    value={formData.clinicAddress.pincode || ''}
                    onChange={handleChange}
                    placeholder="Enter pincode"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;

