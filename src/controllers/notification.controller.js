import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profilePic",
    });

    await Notification.updateMany({ to: userId }, { read: true });

    res.status(200).json(notifications);
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in getNotifications controller:", errorMessage);
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    await Notification.deleteMany({ to: userId });

    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in deleteAllNotifications controller:", errorMessage);
  }
};

export const deleteNotifcation = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    const notification = await Notification.findById(notificationId);

    if (!notification)
      return res.status(404).json({ error: "Notification not found" });

    if (notification.to.toString() !== userId.toString())
      return res
        .status(401)
        .json({ error: "You are not allowed to delete this notification" });

    await Notification.deleteOne({
      _id: notificationId,
      to: userId,
    });

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in deleteNotification controller:", errorMessage);
  }
};
