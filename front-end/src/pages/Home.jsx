import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import VideoCard from "../components/VideoCard";
import { backend } from "../env";


const Home = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVideos, setFilteredVideos] = useState([]);

  // Fetch videos and their owners if the user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      const fetchVideos = async () => {
        try {
          const response = await axios.get(
            `${backend}/api/v1/videos`
          );
          const videosData = response.data.data.videos;

          // Fetch owner data for each video
          const videosWithOwners = await Promise.all(
            videosData.map(async (video) => {
              try {
                const ownerResponse = await axios.get(
                  `${backend}/api/v1/users/${video.owner}`
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

          setVideos(videosWithOwners); // Set videos with owner information
          setFilteredVideos(videosWithOwners); // Initialize filtered videos
          console.log(videosWithOwners);
        } catch (err) {
          setError("Failed to load videos.");
        } finally {
          setLoading(false);
        }
      };
      fetchVideos();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Handle the search query input change
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = videos.filter(
      (video) =>
        video.title.toLowerCase().includes(query) ||
        video.description.toLowerCase().includes(query)
    );
    setFilteredVideos(filtered);
  };

  // Handle navigation to VideoPlayer when a video is clicked

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      {isLoggedIn ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Videos</h1>
          {/* Search Bar */}
          <div className="mb-4 ">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full p-2 border rounded-xl"
            />
          </div>

          {/* Video Grid */}
          <div>
            <VideoCard filteredVideos={filteredVideos} />
          </div>
        </>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Welcome to Our Video Platform
          </h1>
          <p className="mb-4">Please log in or sign up to watch videos.</p>
        </div>
      )}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default Home;
