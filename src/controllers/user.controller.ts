import { Request, Response } from "express";
import User from "../models/user.model";
import { IGetUserAuthInfoRequest, User_T } from "../lib/types/types";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model";
import { Query } from "mongoose";

export const getUser = async (req: Request, res: Response) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.log("Error in getUser controller", errorMessage);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { query } = req.params;

    const users = await User.find({
      username: new RegExp("^" + query, "i"),
    }).select("-password");

    if (!users) {
      return res.status(404).json([]);
    }

    res.status(200).json(users);
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.log("Error in getAllUsers controller", errorMessage);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const followUnfollowUser = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user!._id);

    if (id === req.user!._id.toString()) {
      return res
        .status(400)
        .json({ error: "You can't follow/unfollow yourself" });
    }

    if (!userToModify || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const isFollowing = currentUser.following.includes(id as any);

    if (isFollowing) {
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user!._id } });
      await User.findByIdAndUpdate(req.user!._id, { $pull: { following: id } });
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      await User.findByIdAndUpdate(id, { $push: { followers: req.user!._id } });
      await User.findByIdAndUpdate(req.user!._id, { $push: { following: id } });

      // send notification to the user
      const newNotification = new Notification({
        type: "follow",
        from: req.user!._id,
        to: userToModify._id,
      });

      await newNotification.save();

      res.status(200).json({ message: "User followed succesffully" });
    }
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.log("Error in followUnfollowUser controller", errorMessage);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateUser = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  try {
    const {
      fullName,
      email,
      username,
      currentPassword,
      newPassword,
      bio,
      links,
    }: {
      fullName: string;
      email: string;
      username: string;
      currentPassword: string;
      newPassword: string;
      bio: string;
      links: string[];
    } = req.body;

    let { profilePic, coverPic }: { profilePic: string; coverPic: string } =
      req.body;

    const userId = req.user!._id;

    let user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({
        error: "Please provide both current password and new password",
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch)
        return res.status(400).json({ error: "Current password is incorrect" });

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // check if profile and cover pictures were provided
    // delete old pictures to save on cloudinary storage
    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic.split("/").pop()!.split(".")[0]
        );
      }

      let uploadedResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadedResponse.secure_url;
    }
    if (coverPic) {
      if (user.coverPic) {
        await cloudinary.uploader.destroy(
          user.coverPic.split("/").pop()!.split(".")[0]
        );
      }

      let uploadedResponse = await cloudinary.uploader.upload(coverPic);
      coverPic = uploadedResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.links = links || user.links;
    user.profilePic = profilePic || user.profilePic;
    user.coverPic = coverPic || user.coverPic;

    user = await user.save();

    // password should be null in response
    user.password = "";

    return res.status(200).json(user);
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.log("Error in updateUser controller", errorMessage);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
