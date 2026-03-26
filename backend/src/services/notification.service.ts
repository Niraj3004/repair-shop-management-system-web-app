import { Notification } from "../models/notification.model";

export const getUserNotificationsService = async (userId: string) => {
  // Fetch from database, sorting by newest first
  const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
  return notifications;
};

export const markAsReadService = async (notificationId: string) => {
  // Find notification by ID and set isRead to true
  const updatedNotification = await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true } // Returns the updated document
  );

  if (!updatedNotification) {
    throw new Error("Notification not found");
  }

  return updatedNotification;
};

export const markAllAsReadService = async (userId: string) => {
  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );
  return result;
};
