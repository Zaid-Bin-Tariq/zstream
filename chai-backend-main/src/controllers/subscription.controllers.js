import { Subscription } from "../models/subscription.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import mongoose from 'mongoose';


const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;  // ID of the channel to subscribe/unsubscribe to
  const userId = req.user._id;       // ID of the current user (from the request object)

  try {
    // Check if there's an existing subscription
    const existingSubscription = await Subscription.findOne({
      subscriber: userId,
      channel: channelId,
    });

    if (existingSubscription) {
      // Unsubscribe: Remove the subscription if it already exists
      await Subscription.findByIdAndDelete(existingSubscription._id);
      return res.status(200).json({
        subscribed: false,
        success: true,
        message: "Successfully unsubscribed from the channel",
      });
    } else {
      // Subscribe: Create a new subscription if it doesn't exist
      const newSubscription = new Subscription({
        subscriber: userId,
        channel: channelId,
      });
      await newSubscription.save();
      
      return res.status(201).json({
        subscribed: true,
        success: true,
        message: "Successfully subscribed to the channel",
      });
    }
  } catch (error) {
    console.error("Subscription toggle error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while toggling the subscription",
    });
  }
});


const getSubscribedChannels = asyncHandler(async (req, res) => {
  const userId = req.user._id; // User ID from the authenticated request

  try {
    // Find subscriptions for the user and populate the channel details
    const subscriptions = await Subscription.find({ subscriber: userId })
      .populate({
        path: 'channel', // Populate channel details
        select: 'username avatar subscribersCount', // Select relevant fields
      })
      .exec();

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No subscriptions found for this user.",
      });
    }

    // Extract the populated channel information
    const subscribedChannels = subscriptions.map(sub => sub.channel);

    res.status(200).json({
      success: true,
      data: subscribedChannels,
      message: "Subscribed channels fetched successfully.",
    });
  } catch (error) {
    console.error("Error fetching subscribed channels:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching subscribed channels.",
    });
  }
});

//const getSubscribedChannels = asyncHandler(async (req, res) => {
  // TODO
 // const { channelId } = req.params
  //const result = await Subscription.find({channel: channelId})
//});

export { toggleSubscription, getSubscribedChannels };
