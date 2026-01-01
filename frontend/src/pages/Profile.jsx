import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { profileService } from '../services/profile.service.js';
import { User, Mail, Phone, MapPin, Camera, Save } from 'lucide-react';
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
      
      setFormData({
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
      });
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
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
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
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal information</p>
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

