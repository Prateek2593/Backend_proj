import mongoose, { isValidObjectId } from "mongoose";
import { Likes } from "../models/likes.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on video
  const { videoId } = req.params;
  const { userId } = req.body;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");
  if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user id");

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  const existingLike = await Likes.findOne({ video: videoId, likedBy: userId });
  if (existingLike) {
    await Likes.findByIdAndDelete(existingLike?._id);
    return res
      .status(200)
      .json(new ApiResponse(200), {}, "Video unliked successfully");
  } else {
    const newLike = await Likes.create({
      video: videoId,
      likedBy: userId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200), newLike, "Video liked successfully");
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on comment
  const { commentId } = req.params;
  const { userId } = req.body;

  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment id");
  if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user id");

  const comment = await Video.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  const existingLike = await Likes.findOne({
    comment: commentId,
    likedBy: userId,
  });
  if (existingLike) {
    await Likes.findByIdAndDelete(existingLike?._id);
    return res
      .status(200)
      .json(new ApiResponse(200), {}, "Comment unliked successfully");
  } else {
    const newLike = await Likes.create({
      comment: commentId,
      likedBy: userId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200), newLike, "Comment liked successfully");
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on tweet
  const { tweetId } = req.params;
  const { userId } = req.body;

  if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet id");
  if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user id");

  const tweet = await Video.findById(tweetId);
  if (!tweet) {
    throw new ApiError(400, "Tweet not found");
  }

  const existingLike = await Likes.findOne({ tweet: tweetId, likedBy: userId });
  if (existingLike) {
    await Likes.findByIdAndDelete(existingLike?._id);
    return res
      .status(200)
      .json(new ApiResponse(200), {}, "Tweet unliked successfully");
  } else {
    const newLike = await Likes.create({
      tweet: tweetId,
      likedBy: userId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200), newLike, "Tweet liked successfully");
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const { userId } = req.body;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid User ID");
  }

  const allLikedVideos = await Likes.find({
    likedBy: userId,
    video: { $exists: true },
  }).populate({
    path: "video",
    select: "title description url",
  });

  if (!allLikedVideos) {
    throw new ApiError(400, "No liked videos found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200),
      allLikedVideos,
      "Liked videos retrieved successfully"
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
