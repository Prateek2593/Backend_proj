import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { userId } = req.body;
  // TODO: toggle subscription
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });
  if (existingSubscription) {
    await Subscription.findByIdAndDelete(existingSubscription?._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Channel Unsubscribed successfully"));
  } else {
    const newSubscription = await Subscription.create({
      subscriber: userId,
      channel: channelId,
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, newSubscription, "Channel Subscribed successfully")
      );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  // using find and populate
  /*const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  const subscribers = await Subscription.find({ channel: channelId }).populate({
    path: "subscriber",
    select: "username email",
  });

  if (subscribers.length === 0) {
    throw new ApiError(404, "No subscriber found for this channel");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        "Count of subscribers fetched successfully"
      )
    );*/

  // using aggregation pipelines
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        //match the channel id
        channel: mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users", //collection to join
        localField: "subscriber", //field from the subscription collection
        foreignField: "_id", //field from the user collection
        as: "subscriberInfo", //output array field
      },
    },
    {
      $unwind: "$subscriberInfo", // unwind the array to deconstruct the document
    },
    {
      $project: {
        // project the necessary fields
        "subscriberInfo.username": 1,
        "subscriberInfo.email": 1,
      },
    },
  ]);

  if (subscribers.length === 0) {
    throw new ApiError(404, "No subscriber found for this channel");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers retrieved successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber id");
  }

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        //match the channel id
        subscriber: mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users", //collection to join
        localField: "channel", //field from the subscription collection
        foreignField: "_id", //field from the user collection
        as: "channelInfo", //output array field
      },
    },
    {
      $unwind: "$channelInfo", // unwind the array to deconstruct the document
    },
    {
      $project: {
        // project the necessary fields
        "channelInfo.username": 1,
        "channelInfo.email": 1,
      },
    },
  ]);

  if (subscribedChannels.length === 0) {
    throw new ApiError(404, "No subscribed channels found for this user");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscribed channels retrieved successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
