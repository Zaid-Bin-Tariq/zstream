import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const UpdateAccountSettings = () => {
  const [user, setUser] = useState(null); // State to store the fetched user data
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [avatar, setAvatar] = useState("");
  const [coverImage, setCoverImage] = useState("")
  const navigate = useNavigate();

  // Fetch the current user on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/users/current-user",
          {
            withCredentials: true,
          }
        );
        setUser(response.data.data); // Save the user data to state

        setUsername(response.data.data.fullName); // Initialize the username field
      } catch (err) {
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []); // Empty dependency array means this effect runs once after the component mounts
  console.log(user);
  // Handle Username Update
  const handleUpdateUsername = async () => {
    try {
      setLoading(true);
      await axios.patch(
        "http://localhost:8000/api/v1/users/update-account",
        { fullName: username },
        { withCredentials: true }
      );
      setSuccess("Username updated successfully.");
    } catch (err) {
      setError("Failed to update username.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      setLoading(true);
      await axios.post(
        "http://localhost:8000/api/v1/users/change-password",
        { oldPassword, newPassword: password },
        { withCredentials: true }
      );
      setSuccess("Username updated successfully.");
    } catch (err) {
      setError("Failed to update username.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvatar = async () => {
    try {
      setLoading(true);
  
      // Create FormData and append the avatar file
      const formData = new FormData();
      formData.append("avatar", avatar); // "avatar" is the field name the backend expects
  
      // Axios request to upload the avatar
      await axios.patch(
        "http://localhost:8000/api/v1/users/avatar",
        formData, // Send formData with the file
        {
          headers: {
            "Content-Type": "multipart/form-data", // Set content type to multipart/form-data
          },
          withCredentials: true,
        }
      );
  
      setSuccess("Avatar updated successfully.");
    } catch (err) {
      setError("Failed to update Avatar.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCoverImage = async () => {
    try {
      setLoading(true);
  
      // Create FormData and append the avatar file
      const formData = new FormData();
      formData.append("coverImage", coverImage); // "coverImage" is the field name the backend expects
  
      // Axios request to upload the coverImage
      await axios.patch(
        "http://localhost:8000/api/v1/users/cover-image",
        formData, // Send formData with the file
        {
          headers: {
            "Content-Type": "multipart/form-data", // Set content type to multipart/form-data
          },
          withCredentials: true,
        }
      );
  
      setSuccess("coverImage updated successfully.");
    } catch (err) {
      setError("Failed to update coverImage.");
    } finally {
      setLoading(false);
    }
  };
  

  // Return a loading state if user data is still being fetched
  if (loading) {
    return <div>Loading...</div>;
  }
console.log(avatar);

  // Render
  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Update Account Settings</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}

      {/* Form to update username and password */}
      <div className="flex items-center justify-between">
        <div className="w-2/3">
          <label className="block text-sm font-semibold mb-1">Full Name</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          onClick={handleUpdateUsername}
          className="text-blue-500 hover:underline"
        >
          Change Name
        </button>
      </div>

      {/* Password */}
      <div className="flex items-center justify-between mt-4">
        <div className="w-2/3">
          <label className="block text-sm font-semibold mb-1">
            Old Password
          </label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <label className="block text-sm font-semibold mt-1">
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          onClick={handleUpdatePassword}
          className="text-blue-500 hover:underline"
        >
          Change Password
        </button>
      </div>

      {/* Section for Avatar and Cover Image */}
      <div className="mt-8 space-y-6">
        {/* Avatar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-16 h-16 object-cover rounded-full border mr-4"
            />
            <div>
              <h3 className="font-semibold text-lg">Change Avatar</h3>
              <input
                type="file"
                className="w-3/4 px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setAvatar(e.target.files[0])}
              />
            </div>
          </div>
          <button
            onClick={handleUpdateAvatar}
            className="text-blue-500 hover:underline"
          >
            Change Avatar
          </button>
        </div>

        {/* Cover Image */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={user.coverImage}
              alt="Cover Image"
              className="w-32 h-16 object-cover border mr-4"
            />
            <div>
              <h3 className="font-semibold text-lg">Change Cover Image</h3>
              <input
                type="file"
                className="w-3/4 px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setCoverImage(e.target.files[0])}
              />
            </div>
          </div>
          <button
            onClick={handleUpdateCoverImage}
            className="text-blue-500 hover:underline"
          >
            Change Cover Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateAccountSettings;
