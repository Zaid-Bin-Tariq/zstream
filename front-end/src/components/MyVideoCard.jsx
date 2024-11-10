import React, { useState, useEffect } from "react";
import timeSince from "../utils/TimeSince";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useSelector } from "react-redux";

function MyVideoCard({ filteredVideos }) {
  const userId = useSelector((state) => state.auth.user._id);
  console.log(userId);
  
  const [showModal, setShowModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  const navigate = useNavigate();

  const handleVideoClick = (videoId) => {
    navigate(`/videos/${videoId}`);
  };

  const handleOwnerClick = (event) => {
    event.stopPropagation();
  };

  const handleSaveClick = (videoId, userId) => {
    setSelectedVideoId(videoId); // Store the selected video ID
    fetchPlaylists(userId); // Fetch playlists when the modal opens
    setShowModal(true); // Show the modal
  };

  const handleDeleteClick = async (videoId) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/videos/${videoId}`, {
        withCredentials: true,
      });
      alert("Video deleted successfully");
       // Redirect to homepage or another route after deletion
    } catch (error) {
      console.error("Failed to delete video:", error);
      alert("There was an issue deleting the video. Please try again.");
    }
  };

  const fetchPlaylists = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/playlist/user/${userId}`,
        { withCredentials: true }
      );
      const unfilteredPlaylists = response.data.data;
      setPlaylists(unfilteredPlaylists.filter(
        (playlist) => playlist.videos.length > 0
      ));
      console.log(response.data.data);
      // Assuming response has the list of playlists
    } catch (error) {
      console.error("Error fetching playlists", error);
    }
  };

  const handleAddToPlaylist = async (playlistId, videoId) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/v1/playlist/add/${videoId}/${playlistId}`,
        {},
        {
          withCredentials: true,
        }
      );
      setShowModal(false); // Close the modal after saving
    } catch (error) {
      console.error("Error adding video to playlist", error);
    }
  };

  const handleCreatePlaylist = async (videoId) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/playlist",
        {
          name: newPlaylistName,
          videoId: videoId,
        },
        { withCredentials: true }
      );
      const newPlaylist = response.data;
      console.log(response.data);
      setShowModal(false);
      // After creating a new playlist, add the video to the newly created playlist
      //await handleAddToPlaylist();
    } catch (error) {
      console.error("Error creating playlist", error);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredVideos.length > 0 ? (
        filteredVideos.map((video) => (
          <div
            className=" rounded-xl  p-2 hover:bg-gray-100 hover:cursor-pointer"
            onClick={() => handleVideoClick(video._id)}
            key={video._id}
          >
            {/* Thumbnail */}
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-32 object-cover mb-4 rounded-xl"
            />

            {/* Video Title */}
            <h2 className="font-semibold text-lg mb-2">{video.title}</h2>

            <div className="flex justify-between items-center">
              {/* Uploader's Name */}
              {video.ownerName && (
                <Link
                  to={`/user/${video.ownerName}`}
                  onClick={handleOwnerClick}
                >
                  <span className="text-gray-600 text-sm mb-2">
                    {video.ownerName}
                  </span>
                </Link>
              )}

              {/* Save Icon */}
            </div>

            {/* Views and Time Passed */}
            <div className="text-gray-500 text-xs mb-4 flex justify-between">
              <div>
                <p>
                  {video.views} views • {timeSince(new Date(video.createdAt))}
                </p>
              </div>
              <div>
              <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(video._id);
                  }}
                  className="ml-4 text-gray-600 hover:text-gray-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" ><path d="M11 17H9V8h2v9zm4-9h-2v9h2V8zm4-4v1h-1v16H6V5H5V4h4V3h6v1h4zm-2 1H7v15h10V5z"></path></svg>{" "}
                  {/* Font Awesome Save Icon */}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveClick(video._id, userId);
                  }}
                  className="ml-4 text-gray-600 hover:text-gray-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                    focusable="false"
                    aria-hidden="true"
                  >
                    <path d="M18 4v15.06l-5.42-3.87-.58-.42-.58.42L6 19.06V4h12m1-1H5v18l7-5 7 5V3z"></path>
                  </svg>{" "}
                  {/* Font Awesome Save Icon */}
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No videos found.</p>
      )}

      {/* Playlist Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Save to Playlist</h2>

            {/* List of existing playlists */}
            <ul className="mb-4">
              {playlists.map((playlist) => (
                <li
                  key={playlist._id}
                  className="cursor-pointer mb-2 hover:bg-gray-100 p-2 rounded"
                  onClick={() =>
                    handleAddToPlaylist(playlist._id, selectedVideoId)
                  }
                >
                  {playlist.name}
                </li>
              ))}
            </ul>

            {/* Create new playlist */}
            <input
              type="text"
              placeholder="New playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="border p-2 w-full mb-4"
            />
            <button
              onClick={() => handleCreatePlaylist(selectedVideoId)}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Create Playlist
            </button>

            {/* Close Modal */}
            <button
              onClick={() => setShowModal(false)}
              className="text-red-500 mt-4 hover:underline ml-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyVideoCard;
