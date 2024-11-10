import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import timeSince from "../utils/TimeSince";

function PlaylistVideoPlayer({ id }) {
  // Get video ID from URL params
  const userId = useSelector((state) => state.auth.user._id);
  const [video, setVideo] = useState(null);
  const [username, setUsername] = useState(null);
  const [owner, setOwner] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [commentUpdated, setCommentUpdated] = useState(null);
  const [likedVideos, setLikedVideos] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [commentDelete, setCommentDelete] = useState(true)


  useEffect(() => {
    // Fetch video by id
    const fetchVideoData = async () => {
      try {
        const videoResponse = await axios.get(
          `http://localhost:8000/api/v1/videos/${id}`
        );
        const videoData = videoResponse.data.data;
        console.log(videoData);

        setVideo(videoData);

        // Fetch owner's username
        const userData = await axios.get(
          `http://localhost:8000/api/v1/users/${videoData.owner}`,
          { withCredentials: true }
        );
        const username = userData.data.data.username;
        setUsername(username);

        // Fetch owner's channel profile using ownerId
        const ownerResponse = await axios.get(
          `http://localhost:8000/api/v1/users/c/${username}`,
          { withCredentials: true }
        );
        const ownerData = ownerResponse.data.data;
        console.log(ownerData);

        setOwner(ownerData);
        setOwnerId(ownerData._id);
        //setSubscriptionStatus(ownerData.subscriptionStatus);

        // Fetch comments using id
        const commentsResponse = await axios.get(
          `http://localhost:8000/api/v1/comments/${id}`,
          { withCredentials: true }
        );
        console.log(commentsResponse);

        //setComments(commentsResponse.data.data.comments);
        const comments = commentsResponse.data.data.comments;
        const commentsWithUserInfo = await Promise.all(
          comments.map(async (comment) => {
            // Fetch user information based on the comment's owner property
            try {
              console.log(
                "Fetching user info for comment owner:",
                comment.owner
              );
              const userResponse = await axios.get(
                `http://localhost:8000/api/v1/users/${comment.owner}`,
                { withCredentials: true }
              );
              console.log("User response:", userResponse.data); // Should log user data

              comment.username = userResponse.data.data.username;
              comment.avatar = userResponse.data.data.avatar;
              return comment;
            } catch (error) {
              console.log(
                "Error fetching user info for comment:",
                comment,
                error
              );
            }
          })
        );
        setComments(commentsWithUserInfo);
      } catch (err) {
        setError("Failed to load video details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserLikedVideos = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/likes/videos",
          { withCredentials: true }
        );
        const likedVideos = response.data.data;
        setLikedVideos(response.data.data);

        setIsLiked(likedVideos.some((video) => video._id === id));
      } catch (error) {
        console.error("Error fetching user's liked videos:", error);
      }
    };

    fetchUserLikedVideos();

    fetchVideoData();
  }, [id, likes, commentUpdated, subscriptionStatus, commentDelete]);

  const handleLike = async () => {
    try {
      await axios.patch(
        `http://localhost:8000/api/v1/likes/toggle/v/${id}`,
        {},
        { withCredentials: true }
      );
      setLikes(likes + 1); // Increment likes on click
    } catch (err) {
      console.error("Failed to like video", err);
    }
  };

  const handleSaveClick = (videoId, ownerId) => {
    setSelectedVideoId(videoId); // Store the selected video ID
    fetchPlaylists(ownerId); // Fetch playlists when the modal opens
    setShowModal(true); // Show the modal
  };

  const fetchPlaylists = async (ownerId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/playlist/user/${ownerId}`,
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

      // After creating a new playlist, add the video to the newly created playlist
      setShowModal(false);
    } catch (error) {
      console.error("Error creating playlist", error);
    }
  };

  const handleSubscriptionToggle = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/v1/subscriptions/c/${owner._id}`,
        {},
        { withCredentials: true }
      );
      console.log(response.data);
      
      setSubscriptionStatus(response.data.subscribed);
      console.log("done");

      // setSubscriptionStatus(owner.subscriptionStatus)// Toggle subscription status
    } catch (err) {
      console.error("Failed to subscribe/unsubscribe", err);
    }
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim() === "") return;
    try {
      const response = await axios.post(
        `http://localhost:8000/api/v1/comments/${id}`,
        {
          content: newComment,
        },
        { withCredentials: true }
      );

      setCommentUpdated([response.data.data]);
      setNewComment(""); // Clear input after submit
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };
  console.log(comments);

  const handleCommentLike = async (commentId) => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/v1/likes/toggle/c/${commentId}`,
        {},
        { withCredentials: true }
      );
      console.log(response.data);
    } catch (err) {
      console.error("comment liking error:");
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/v1/comments/c/${commentId}`,
        { withCredentials: true }
      );
      console.log(response.data);
      setCommentDelete(!commentDelete)
    } catch (err) {
      console.error("comment deleting error:");
    }
  };

  console.log(likedVideos);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex w-full">
      <div className="flex-col">
        {/* Video Player */}
        <video
          src={video.videoFile}
          controls
          className="w-full rounded-xl"
        ></video>

        {/* Title */}
        <h2 className="text-3xl font-bold mt-2">{video.title}</h2>

        {/* Owner info */}
        <div className="flex items-center my-3">
          <img
            src={owner.avatar}
            alt="Owner Avatar"
            className="w-12 h-12 rounded-full"
          />
          <div className="ml-3">
            <p>{owner.username}</p>

            <p className="text-gray-500">
              {owner.subscribersCount} subscribers
            </p>
          </div>
          <button
            onClick={handleSubscriptionToggle}
            className="bg-blue-500 text-white px-3 py-1 rounded mt-1 ml-4"
          >
            {subscriptionStatus ? "Unsubscribe" : "Subscribe"}
          </button>
          <button
            onClick={handleLike}
            className={`ml-5 px-3 py-1 rounded ${
              isLiked ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Like
          </button>
          <p className="ml-2">{video.likesCount} likes</p>
          <button
            onClick={() => handleSaveClick(video._id, userId)}
            className="ml-5 bg-gray-200 text-black px-3 py-1 rounded"
          >
            Save
          </button>
        </div>

        {/* Video metadata */}
        <p className="mt-2 font-bold">
        {timeSince(new Date(video.createdAt))} ago {" "}
        </p>

        {/* Video description */}
        <p className="">{video.description}</p>

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

        {/* Comment input */}
        <div className="mt-5 flex gap-2">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleCommentSubmit}
            className="bg-blue-500 text-white px-3 rounded"
          >
            Post
          </button>
        </div>

        {/* Comments section */}
        <div className="mt-5">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="mb-5">
                <div className="flex items-center">
                  <img
                    src={comment.avatar}
                    alt="Commenter Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <div className="flex gap-3 items-center">
                      <p>{comment.username}</p>
                      <p className="text-gray-500 text-sm">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="mt-1">{comment.content}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-1 ml-12">
                  
                  {comment.owner === userId && (
                    <div className="flex space-x-3 mt-1 ml-12">
                      <button
                        onClick={() => handleCommentDelete(comment._id)}
                        className="text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No comments yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlaylistVideoPlayer;
