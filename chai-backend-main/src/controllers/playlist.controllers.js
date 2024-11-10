import mongoose from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { checkOwnership } from "../utils/checkOwnership.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const owner = req.user._id; // Get the owner from the authenticated user
  const { name, videoId } = req.body; // Only take name and videoId from the request body

  // Check if name and videoId are provided
  if (!name || !videoId) {
    throw new ApiError(400, "Name and videoId are required");
  }

  // Validate the videoId as a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  // Create the new playlist with the provided name, owner, and videoId
  const result = await Playlist.create({
    name,
    videos: [videoId], // Store videoId in the videos array
    owner,
  });

  // If something goes wrong during creation
  if (!result) {
    throw new ApiError(500, "Something went wrong");
  }

  // Respond with the newly created playlist
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Playlist created successfully"));
});


const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  validateObjectId(userId, "User");

  const result = await Playlist.find({
    owner: userId,
  });

  

  if (!result) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Successfully fetched playlist"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  validateObjectId(playlistId, "Playlist");

  const result = await Playlist.findById(playlistId);

  if (!result) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Successfully fetched playlist"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;

  validateObjectId(videoId, "Video");
  validateObjectId(playlistId, "Playlist");

  const result = await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { videos: videoId } }, // $addToSet ensures no duplicates
    { new: true } // Return the updated playlist
  );

  if (!result) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Successfully added video to the playlist")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;

  validateObjectId(videoId, "Video");
  validateObjectId(playlistId, "Playlist");

  const result = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: videoId } }, // $pull removes the video
    { new: true } // Return the updated playlist
  );

  if (!result) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Successfully removed video from the playlist"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { playlistId } = req.params;

  validateObjectId(playlistId, "Playlist");

  const result = await Playlist.findById(playlistId);

  if (!result) {
    throw new ApiError(404, "Playlist not found");
  }

  checkOwnership(result.owner, userId);

  await result.deleteOne({ _id: playlistId });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Successfully deleted playlist"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if ([name, description].some((item) => !item)) {
    throw new ApiError(400, "All fields are required");
  }

  validateObjectId(playlistId, "Playlist");

  const result = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      name,
      description,
    },
    { new: true }
  );

  if (!result) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Successfully updated playlist"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
