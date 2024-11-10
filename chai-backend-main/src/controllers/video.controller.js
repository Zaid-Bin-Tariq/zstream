import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Playlist } from "../models/playlist.models.js"; 
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { checkOwnership } from "../utils/checkOwnership.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;
  const offset = page * limit - limit;

  // Define sort options based on sortBy and sortType
  const sortOptions = {};
  sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

  // Build filter query
  const filter = query
    ? {
        title: { $regex: query, $options: "i" },
      }
    : {};

  try {
    const list = await Video.find(filter)
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const totalVideos = await Video.countDocuments(filter);
    const totalPages = Math.ceil(totalVideos / limit);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { videos: list, totalPages, currentPage: parseInt(page) },
          "Videos fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error fetching videos");
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const videoLocalPath = req.files?.videoFile?.[0].path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0].path;
  const userId = req.user?._id;

  console.log(title);
  
  if (
    [title, description, videoLocalPath, thumbnailLocalPath].some(
      (field) => !field?.trim()
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  let video,
    thumbnail = "";

  try {
    video = await uploadOnCloudinary(videoLocalPath);
    console.log("Uploaded Video", video?.public_id);
    console.log("Title:", title);
  } catch (error) {
    console.log("Error Uploading Video", error);
    throw new ApiError(500, "Failed to upload video");
  }

  try {
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    console.log("Uploaded Thumbnail", thumbnail?.public_id);
  } catch (error) {
    console.log("Error Uploading Thumbnail", error);
    throw new ApiError(500, "Failed to upload thumbnail");
  }

  try {
    const publishedVideo = await Video.create({
      videoFile: video?.url,
      thumbnail: thumbnail?.url,
      title,
      description,
      duration: video?.duration,
      owner: userId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, publishedVideo, "Video published successfully")
      );
  } catch (error) {
    console.log("Video published failed");

    if (video) await deleteFromCloudinary(video.public_id);
    if (thumbnail) await deleteFromCloudinary(thumbnail.public_id);

    throw new ApiError(
      500,
      "Something went wrong while publishing video & files were deleted"
    );
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Validate videoId
  validateObjectId(videoId, "Video");

  try {
    const video = await Video.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(videoId) }, // Match the video by videoId
      },
      {
        $lookup: {
          from: "likes", // The name of the likes collection
          localField: "_id", // The field from the video collection
          foreignField: "video", // Correct field name from Like schema
          as: "likes", // Name of the field where the joined data will be stored
        },
      },
      {
        $addFields: {
          likesCount: { $size: "$likes" }, // Add a new field for the number of likes
        },
      },
      {
        $project: {
          likes: 0, // Exclude the `likes` array from the result (optional)
        },
      },
    ]);

    if (!video || video.length === 0) {
      throw new ApiError(404, "Video not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, video[0], "Video fetched successfully"));
  } catch (error) {
    console.error("Error fetching video:", error); // Better error logging
    throw new ApiError(500, "Error fetching video");
  }
});



const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  validateObjectId(videoId, "Video");

  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(404, "All fields are required");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.title = title;
  video.description = description;
  video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = async (req, res) => {
  const { videoId } = req.params;

  try {
    // Step 1: Delete the video from the Video collection
    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Step 2: Remove video references from all playlists
    await Playlist.updateMany(
      { videos: videoId },
      { $pull: { videos: videoId } }
    );

    return res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { published } = req.body;

  if (published === undefined) {
    throw new ApiError(400, "Published field is required");
  }

  validateObjectId(videoId, "Video");

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  (video.isPublished = published), video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video status updated successfully"));
});



const addVideoToWatchHistory = async (req, res) => {
  const { userId, videoId } = req.body;

  try {
    // Check if the video exists
    const videoExists = await Video.findById(videoId);
    if (!videoExists) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Update user's watch history
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { watchHistory: videoId }, // $addToSet prevents duplicate entries
      },
      { new: true }
    ).populate('watchHistory'); // Optional: populate watchHistory to return full details

    return res.status(200).json({
      message: "Video added to watch history",
      watchHistory: user.watchHistory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  addVideoToWatchHistory
};
