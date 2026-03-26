import { Request, Response } from "express";
import Message from "../models/message.model";

export const getConversation = async (req: Request, res: Response) => {
  try {
    const { partnerId } = req.params;
    const userId = (req as any).user._id; 

    if (!partnerId) {
      res.status(400).json({ success: false, message: "Partner ID is required" });
      return;
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    })
      .sort({ createdAt: 1 }) 
      .populate("senderId", "firstName lastName email role")
      .populate("receiverId", "firstName lastName email role");

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ success: false, message: "Failed to fetch conversation" });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const count = await Message.countDocuments({
      receiverId: userId,
      isRead: false,
    });
    res.status(200).json({ success: true, data: count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ success: false, message: "Failed to fetch unread count" });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { partnerId } = req.params;
    const userId = (req as any).user?._id;

    if (!partnerId || !userId) {
      res.status(400).json({ success: false, message: "Required parameters missing" });
      return;
    }

    await Message.updateMany(
      { senderId: partnerId as any, receiverId: userId as any, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, message: "Conversation marked as read" });
  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).json({ success: false, message: "Failed to mark as read" });
  }
};

export const getUnreadCountsGrouped = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const counts = await Message.aggregate([
      { $match: { receiverId: userId as any, isRead: false } },
      { $group: { _id: "$senderId", count: { $sum: 1 } } }
    ]);

    // Format as a simple map { senderId: count }
    const countsMap = counts.reduce((acc: any, curr: any) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    res.status(200).json({ success: true, data: countsMap });
  } catch (error) {
    console.error("Error fetching grouped counts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch counts" });
  }
};
