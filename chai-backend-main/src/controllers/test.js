const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.body;
    const currentUserId = req.user.id;
  
    // Ensure page and limit are integers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    
    validateObjectId(videoId, "Video");
  
    const offset = (pageNumber - 1) * limitNumber;
  
    
  
    // Execute the aggregation
    const comments = await Comment.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(videoId) }, // Match the video by videoId
        },
        {
          $lookup: {
            from: "likes", // The name of the likes collection
            localField: "_id", // The field from the video collection
            foreignField: "comment", // Correct field name from Like schema
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
  
    // Count total comments for pagination
    const totalComments = await Comment.countDocuments({ video: videoId });
    const totalPages = Math.ceil(totalComments / limitNumber);
  
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { comments, totalComments, totalPages, currentPage: pageNumber },
          "Comments fetched successfully"
        )
      );
  });
  