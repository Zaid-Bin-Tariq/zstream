import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import MyVideos from "./MyVideos";
import VideoCard from "../components/VideoCard";
import MyVideoCard from "../components/MyVideoCard";
const UserPage = () => {
  const user = useSelector((state) => state.auth.user);
  const [playlists, setPlaylists] = useState([]);
  const [selectedSection, setSelectedSection] = useState("playlists");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videos, setVideos] = useState([]);

  console.log(user);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const playlistResponse = await axios.get(
          `http://localhost:8000/api/v1/playlist/user/${user._id}`,
          { withCredentials: true }
        );
        const unfilteredPlaylists = playlistResponse.data.data;
        const filteredPlaylists = unfilteredPlaylists.filter(
          (playlist) => playlist.videos.length > 0
        );
        console.log(filteredPlaylists);

        const updatedPlaylists = await Promise.all(
          filteredPlaylists.map(async (playlist) => {
            const videoId = playlist.videos[0];

            const videoResponse = await axios.get(
              `http://localhost:8000/api/v1/videos/${videoId}`,
              { withCredentials: true }
            );
            const videoData = videoResponse.data.data;
            return {
              ...playlist,
              thumbnail: videoData.thumbnail,
            };
          })
        );
        setPlaylists(updatedPlaylists);
      } catch (err) {
        console.error(err);
        setError("Failed to load playlists");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, [user._id]);
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/users/c/${user.username}`,
          { withCredentials: true }
        );
        console.log(response.data.data.videos);
        const videosData = response.data.data.videos;

        const videosWithOwners = await Promise.all(
          videosData.map(async (video) => {
            try {
              const ownerResponse = await axios.get(
                `http://localhost:8000/api/v1/users/${video.owner}`
              ); // Fetch owner data by owner ID
              video.ownerName = ownerResponse.data.data.username;
              console.log(video);
              // Add owner data to video object
            } catch (err) {
              console.error("Failed to load owner data for video", video._id);
            }
            return video;
          })
        );
        setVideos(videosWithOwners);
      } catch (err) {
        setError("Failed to fetch videos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);
  console.log(videos);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 w-full">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full">
        <div className="relative">
          {user?.coverImage && (
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-64 object-cover"
            />
          )}

          {/* Render avatar */}
          {user?.avatar && (
            <img
              src={user.avatar}
              alt={user.username}
              className="absolute bottom-0 left-4 w-32 h-32 rounded-full border-4 border-white"
            />
          )}
        </div>

        {/* User's full name */}
        <h1 className="text-2xl font-bold mt-4">{user?.username}</h1>

        {/* Number of subscribers */}
        <p>{user.subscribersCount}3 subscribers</p>

        {/* Number of videos */}
        <p className="mb-6">{videos.length} videos</p>

        {/* Navigation Buttons */}
        <div className="flex gap-6 mb-6">
          <button
            onClick={() => setSelectedSection("playlists")}
            className={`px-4 py-2 rounded ${
              selectedSection === "playlists"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            Playlists
          </button>
          <button
            onClick={() => setSelectedSection("myVideos")}
            className={`px-4 py-2 rounded ${
              selectedSection === "myVideos"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            My Videos
          </button>
          <Link to="/UploadVideo">
            <button className="bg-gray-200 py-2 px-4 rounded">
              Upload Video
            </button>
          </Link>
          <Link to="/UpdateAccount">
            <button className="bg-gray-200 py-2 px-4 rounded">
              Update Account Settings
            </button>
          </Link>
        </div>

        {/* Conditional Rendering of Sections */}

        {selectedSection === "playlists" && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Playlists</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {playlists.length > 0 ? (
                playlists.map((playlist) =>
                  (
                    <Link
                      key={playlist._id}
                      to={`/playlist/${playlist._id}`}
                      className="block rounded-xl p-2 hover:bg-gray-100"
                    >
                      <div className="relative border rounded shadow-lg">
                        <img
                          src={playlist.thumbnail}
                          alt=""
                          className="w-full h-32 object-cover rounded-xl"
                        />
                        <div className="absolute bottom-0 right-0 bg-gray-700 bg-opacity-75 text-white text-xs p-1 m-2 rounded">
                          {playlist.videos.length} videos
                        </div>
                      </div>
                      <h1 className="text-lg font-semibold">{playlist.name}</h1>
                    </Link>
                  )
                )
              ) : (
                <p>No playlists found</p>
              )}
            </div>
          </div>
        )}

        {selectedSection === "myVideos" && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">My Videos</h3>
            <MyVideoCard filteredVideos={videos} />
            {/* Add My Videos content or component here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPage;
