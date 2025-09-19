import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/api';

interface ProfileData {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  collegeId?: number;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  bio?: string;
  profileImageUrl?: string;
  isProfileComplete: boolean;
  rating?: number;
  completedSales?: number;
  createdAt: string;
  updatedAt: string;
  college?: any;
  products?: any[];
}

interface ProfileSectionProps {
  profileData: ProfileData | null;
  loading: boolean;
  onProfileUpdate: () => void;
}

interface College {
  id: number;
  name: string;
}

export function ProductSellerProfileSection({ profileData, loading, onProfileUpdate }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    collegeId: '',
    address: '',
    bio: '',
    profileImageUrl: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
const [colleges, setColleges] = useState<College[]>([]);

 // Fetch colleges from backend
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await api.get('/api/colleges');
        setColleges(res.data);
      } catch (err) {
        console.error('Error fetching colleges:', err);
        toast.error('Failed to load colleges');
      }
    };
    fetchColleges();
  }, []);

  // Initialize form data when profileData changes - FIX: Changed from useState to useEffect
  useEffect(() => {
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phoneNumber: profileData.phoneNumber || '',
        collegeId: profileData.collegeId?.toString() || '',
        address: profileData.address || '',
        bio: profileData.bio || '',
        profileImageUrl: profileData.profileImageUrl || ''
      });
    }
  }, [profileData]); // Added dependency array

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    try {
      setUploadingImage(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/api/product-seller/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData(prev => ({ ...prev, profileImageUrl: response.data.url }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.put('/api/product-seller', {
        ...formData,
        collegeId: formData.collegeId ? parseInt(formData.collegeId) : null,
        latitude: profileData?.latitude,
        longitude: profileData?.longitude
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      toast.success('Profile updated successfully');
      setIsEditing(false);
      onProfileUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Product Seller Profile</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {formData.profileImageUrl ? (
              <img
                src={formData.profileImageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-4xl text-gray-400">👤</div>
            )}
          </div>
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {uploadingImage && (
                <p className="text-sm text-gray-500 mt-1">Uploading...</p>
              )}
            </div>
          )}
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              College
            </label>
            <select
              name="collegeId"
              value={formData.collegeId}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select College</option>
              {colleges.map((college) => (
              <option key={college.id} value={college.id}>
                {college.name}
              </option>
            ))}
            </select>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            disabled={!isEditing}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Tell us about yourself and your products..."
          />
        </div>

        {isEditing && (
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                if (profileData) {
                  setFormData({
                    firstName: profileData.firstName || '',
                    lastName: profileData.lastName || '',
                    phoneNumber: profileData.phoneNumber || '',
                    collegeId: profileData.collegeId?.toString() || '',
                    address: profileData.address || '',
                    bio: profileData.bio || '',
                    profileImageUrl: profileData.profileImageUrl || ''
                  });
                }
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
}