import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const UploadVideo = () => {
  // State to manage form inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const userId = useSelector((state) => state.auth.user._id);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Create FormData to send the file
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("thumbnail", thumbnail);
    formData.append("videoFile", videoFile);
    //formData.append("userId", videoFile);


    console.log('Form Data:', formData.get('title'), formData.get('description'), formData.get('thumbnail'), formData.get('videoFile'));
    console.log(userId);
    

    try {
      // POST request to upload video data
      const response = await axios.post(
        "http://localhost:8000/api/v1/videos",
        formData,
        {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true// Important for sending cookies
          },
          
      );
      setUploadSuccess(response.data.message);
      
      
    } catch (error) {
      console.error("Error uploading video:", error);
      setUploadSuccess("Failed to upload video.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file inputs for thumbnail and video
  const handleThumbnailChange = (e) => setThumbnail(e.target.files[0]);
  const handleVideoFileChange = (e) => setVideoFile(e.target.files[0]);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload Your Video</h2>

      {/* Success or failure message */}
      {uploadSuccess && (
        <p
          className={`mb-4 text-sm ${
            uploadSuccess.includes("Failed") ? "text-red-600" : "text-green-600"
          }`}
        >
          {uploadSuccess}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {/* Title Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:border-indigo-500"
            placeholder="Enter video title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:border-indigo-500"
            placeholder="Enter video description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            required
          />
        </div>

        {/* Thumbnail Image Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail Image
          </label>
          <input
            type="file"
            className="w-full"
            accept="image/*"
            onChange={handleThumbnailChange}
            required
          />
        </div>

        {/* Video File Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video File
          </label>
          <input
            type="file"
            className="w-full"
            accept="video/*"
            onChange={handleVideoFileChange}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full p-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none ${
            isLoading ? "opacity-50" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </div>
  );
};

export default UploadVideo;
