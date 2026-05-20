import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import customFetch from "@/utils/customFetch";
import { BounceLoader } from "react-spinners";

interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  location: string;
  avatar: string;
  role: string;
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    location: "",
  });
  const [errors, setErrors] = useState({
    fullName: "",
    phoneNumber: "",
    location: "",
  });

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await customFetch.get("/users/current-user");
        setProfile(data.user);
        setFormData({
          fullName: data.user.fullName,
          phoneNumber: data.user.phoneNumber,
          location: data.user.location,
        });
      } catch (error) {
        console.error("Profile loading error:", error);
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      fullName: "",
      phoneNumber: "",
      location: "",
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
      isValid = false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
      isValid = false;
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await customFetch.patch("/users/update-user", formData);
      setProfile(data.user);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Profile loading error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const formData = new FormData();
    formData.append("avatar", e.target.files[0]);

    setIsLoading(true);
    try {
      const { data } = await customFetch.patch("/users/update-user", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setProfile(data.user);
      toast.success("Profile photo updated successfully");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to update profile photo");
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-20 backdrop-blur-md">
        <BounceLoader size={50} color="#EE1133" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 font-Mainfront">
      <Toaster position="top-center" />
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-semibold text-gray-800">
          Profile Information
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-event-red hover:text-red-700 font-semibold"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4 pb-8 border-b border-gray-200">
          <div className="flex flex-col items-center">
            <img
              src={
                profile.avatar
                  ? `http://localhost:5000/${profile.avatar}`
                  : `http://localhost:5000/uploads/default-avatar.png`
              }
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-lg"
            />
            {isEditing && (
              <>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer text-event-red hover:text-red-700 mt-4 text-sm font-semibold"
                >
                  Change Photo
                </label>
              </>
            )}
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-800">
              {profile.fullName}
            </h3>
            <p className="text-gray-500 text-lg capitalize">{profile.role}</p>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                )}
              </>
            ) : (
              <p className="text-gray-800 text-lg">{profile.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <p className="text-gray-800 text-lg">{profile.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            {isEditing ? (
              <>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-800 text-lg">{profile.phoneNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                />
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                )}
              </>
            ) : (
              <p className="text-gray-800 text-lg">{profile.location}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-event-red hover:bg-red-700 text-white px-6 py-2 rounded-md font-semibold transition duration-200"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  fullName: profile.fullName,
                  phoneNumber: profile.phoneNumber,
                  location: profile.location,
                });
                setErrors({ fullName: "", phoneNumber: "", location: "" });
              }}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md font-semibold hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
