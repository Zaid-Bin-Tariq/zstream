import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import VideoCard from "../components/VideoCard";

const User = () => {
  const { username } = useParams(); // Extract the username from the URL
  const [userData, setUserData] = useState(null); // Store user data
  const [playlists, setPlaylists] = useState([]); // Store user playlists
  const [subscribers, setSubscribers] = useState(0); // Store number of subscribers
  const [videos, setVideos] = useState([]); // Store user videos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data based on username
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(
          `http://localhost:8000/api/v1/users/c/${username}`,
          { withCredentials: true }
        );
        const user = userResponse.data.data;
        setVideos(user.videos);
        console.log(userResponse.data.data);
        //console.log(username);

        setUserData(user);

        // Fetch playlists using user ID
        const playlistResponse = await axios.get(
          `http://localhost:8000/api/v1/playlist/user/${user._id}`,
          { withCredentials: true }
        );
        setPlaylists(playlistResponse.data.data);
        console.log(playlistResponse.data.data);
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
    <div className="p-4">
      {/* Render cover image */}
      <div className="relative">
        {userData?.coverImage && (
          <img
            src={userData.coverImage}
            alt="Cover"
            className="w-full h-64 object-cover"
          />
        )}

        {/* Render avatar */}
        {userData?.avatar && (
          <img
            src={userData.avatar}
            alt={userData.username}
            className="absolute bottom-0 left-4 w-32 h-32 rounded-full border-4 border-white"
          />
        )}
      </div>

      {/* User's full name */}
      <h1 className="text-2xl font-bold mt-4">{userData?.username}</h1>

      {/* Number of subscribers */}
      <p>{userData.subscribersCount} subscribers</p>

      {/* Number of videos */}
      <p>{videos.length} videos</p>

      {/* User's videos */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {videos.length > 0 ? (
            videos.map((video) => (
              <div key={video._id} className="border rounded shadow-lg p-4">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-32 object-cover mb-4"
                />
                <h3 className="font-semibold text-lg">{video.title}</h3>
                <p className="text-gray-600">
                  {video.views} views •{" "}
                  {new Date(video.createdAt).toDateString()}
                </p>
              </div>
            ))
          ) : (
            <p>No videos found</p>
          )}
        </div>
      </div>

      {/* User's playlists */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Playlists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.length > 0 ? (
            playlists.map((playlist) => (
              <div key={playlist._id} className="border rounded shadow-lg p-4">
                <img
                  src={playlist.thumbnail}
                  alt={playlist.title}
                  className="w-full h-32 object-cover mb-4"
                />
                <h3 className="font-semibold text-lg">{playlist.title}</h3>
                <p className="text-gray-600">{playlist.videoCount} videos</p>
              </div>
            ))
          ) : (
            <p>No playlists found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default User;
