import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const VideoPlayer = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedVideos, setLikedVideos] = useState(null)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/v1/videos/${id}`);
        setVideo(response.data.data.videoFile); // Assuming API returns the video data
        console.log(response.data.data);
        
      } catch (err) {
        setError('Failed to load video.');
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  if (loading) return <div>Loading video...</div>;

  return (
    <div>
      {video ? (
        <>
          <h1 className="text-2xl font-bold mb-4">{video.title}</h1>
          <video controls width="100%" height="auto" src={video}
          onError={(e) => console.log("Error loading video", e)} />
        </>
      ) : (
        <p>{error}</p>
      )}
    </div>
  );
};

export default VideoPlayer;
