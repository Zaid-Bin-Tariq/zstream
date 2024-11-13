import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PlaylistVideoPlayer from "../components/PlaylistVideoPlayer";
import VideoCard from "../components/VideoCard";
import SmallVideoCard from "../components/SmallVideoCard";
import { backend } from "../env";
const PlaylistVideo = () => {
  const { playlistId } = useParams(); // Get the playlist ID from the URL
  const [playlist, setPlaylist] = useState(null); // State to store the fetched playlist data
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(null); // State to handle any errors
  const [videos, setVideos] = useState(null);

  // Fetch playlist data based on the playlist ID
  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await axios.get(
          `${backend}/api/v1/playlist/${playlistId}`, // API endpoint to fetch playlist by ID
          { withCredentials: true } // Include credentials if necessary for authentication
        );
        setPlaylist(response.data.data);
        const videos = response.data.data.videos;
        const [_, ...remainingIds] = videos;
        try {
          // Loop through remaining IDs and make Axios requests
          const videoData = await Promise.all(
            remainingIds.map(async (id) => {
              const response = await axios.get(
                `${backend}/api/v1/videos/${id}`,
                {
                  withCredentials: true,
                }
              );

              return response.data.data;
            })
          );

          const videosWithOwners = await Promise.all(
            videoData.map(async (video) => {
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
          console.log("Fetched video data:", videoData);
          return videoData;
        } catch (err) {
          setError("Failed to load playlist data");
        }

        // Save the playlist data to state
      } catch (err) {
        setError("Failed to load playlist data");
      } finally {
        setLoading(false); // Set loading to false after the fetch is complete
      }
    };

    fetchPlaylist();
  }, [playlistId]); // Fetch data when the playlist ID changes
  console.log(videos);

  // Return loading state
  if (loading) return <div>Loading...</div>;

  // Return error state
  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-col mt-[-32px] md:flex-row md:mt-0">
      <div className="w-full md:p-5 md:w-2/3">
        <PlaylistVideoPlayer id={playlist.videos[0]} />
      </div>

      <div className="w-full flex flex-col gap-4 p-5 md:w-1/3">
        <SmallVideoCard filteredVideos={videos} />
      </div>
    </div>
  );
};

export default PlaylistVideo;
