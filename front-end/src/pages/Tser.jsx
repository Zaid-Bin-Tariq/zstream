import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // Import Link
import axios from "axios";
import VideoCard from "../components/VideoCard";

const User = () => {
  const { username } = useParams(); // Extract the username from the URL
  const [user, setUser] = useState(null); // Store user data
  const [playlists, setPlaylists] = useState([]); // Store user playlists
  const [subscribers, setSubscribers] = useState(0); // Store number of subscribers
  const [videos, setVideos] = useState([]); // Store user videos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSection, setSelectedSection] = useState("Videos");

  // Fetch user data based on username
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(
          `http://localhost:8000/api/v1/users/c/${username}`,
          { withCredentials: true }
        );
        const user = userResponse.data.data;
        const videosData = user.videos;
        setUser(user);

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

        // Fetch playlists using user ID
        const playlistResponse = await axios.get(
          `http://localhost:8000/api/v1/playlist/user/${user._id}`,
          { withCredentials: true }
        );
        const unfilteredPlaylists = playlistResponse.data.data;
        const filteredPlaylists = unfilteredPlaylists.filter(
          (playlist) => playlist.videos.length > 0
        );

        // Iterate over playlists to fetch video data for each playlist
        const updatedPlaylists = await Promise.all(
          filteredPlaylists.map(async (playlist) => {
            // Fetch video data based on videoId from playlist
            const videoId = playlist.videos[0];
            const videoResponse = await axios.get(
              `http://localhost:8000/api/v1/videos/${videoId}`,
              { withCredentials: true }
            );
            const videoData = videoResponse.data.data;
            console.log(videoData);

            // Add video avatar to the corresponding playlist
            return {
              ...playlist,
              thumbnail: videoData.thumbnail, // Assuming video data has an avatar field
            };
          })
        );

        setPlaylists(updatedPlaylists);
        console.log(updatedPlaylists);
      } catch (err) {
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 w-full">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full">
        <div className="relative">
          
            <img
              src={user.coverImage}
              alt="Cover Image"
              className="w-full h-64 object-cover"
            />
          

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
        <p>{user.subscribersCount} subscribers</p>

        {/* Number of videos */}
        <p className="mb-6">{videos.length} videos</p>

        {/* Navigation Buttons */}
        <div className="flex gap-6 mb-6">
          <button
            onClick={() => setSelectedSection("Videos")}
            className={`px-4 py-2 rounded ${
              selectedSection === "Videos"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            Videos
          </button>
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
        </div>

        {/* Conditional Rendering of Sections */}

        {selectedSection === "playlists" && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Playlists</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <Link
                    key={playlist._id}
                    to={`/playlist/${playlist._id}`}
                    className="block rounded-xl p-2 hover:bg-gray-100"
                  >
                    <div className="relative  ">
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
                ))
              ) : (
                <p>No playlists found</p>
              )}
            </div>
          </div>
        )}

        {selectedSection === "Videos" && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Videos</h3>
            <VideoCard filteredVideos={videos} />
            {/* Add My Videos content or component here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default User;
