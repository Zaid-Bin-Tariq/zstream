import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import VideoCard from "../components/VideoCard";
import { backend } from "../env";
const MyVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the username from the Redux store
  const username = useSelector((state) => state.auth.user.user.username);
  console.log(username);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(
          `${backend}/api/v1/users/c/${"zaid%20chaudhary"}`,
          { withCredentials: true }
        );
        console.log(response.data.data.videos);
        const videosData = response.data.data.videos;

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
        setVideos(videosWithOwners);
      } catch (err) {
        setError("Failed to fetch videos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchVideos();
    }
  }, [username]);
  console.log(videos);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="my-videos">
      <VideoCard filteredVideos={videos} />
    </div>
  );
};

export default MyVideos;
