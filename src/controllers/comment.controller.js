import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { populate } from "dotenv";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new ApiError(400, "Video is required");
  }

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (
    isNaN(pageNumber) ||
    isNaN(limitNumber) ||
    pageNumber <= 0 ||
    limitNumber <= 0
  ) {
    throw new ApiError(400, "Page and limit must be positive number");
  }

  const options = {
    page: pageNumber,
    limit: limitNumber,
    populate: owner,
    sort: { createdAt: -1 },
  };

  const comments = await Comment.paginate({ video: videoId }, options);

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments retrieved successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { content } = req.body;
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  const comment = await Comment.create({
    content,
    videoId,
    owner: req.user?._id,
  });
  if (!comment) {
    throw new ApiError(400, "Error while commenting");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Successfull comment"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { id } = req.params;
  const { content } = req.body;

  const commentId = await Comment.findById(id);
  if (!commentId) {
    throw new ApiError(400, "Invalid Comment");
  }

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const newComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );
  if (!newComment) {
    throw new ApiError(400, "Error in updating new comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { id } = req.params;

  const commentId = await Comment.findById(id);
  if (!commentId) {
    throw new ApiError(400, "Comment not found");
  }

  const commentToBeDeleted = await Comment.findByIdAndDelete(commentId);
  if (!commentToBeDeleted) {
    throw new ApiError(400, "Error while deleting the comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
