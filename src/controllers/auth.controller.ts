import { Request, Response } from "express";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import { User_T } from "../lib/types/types";

interface IGetUserAuthInfoRequest extends Request {
  user?: Record<string, any>;
}

export const checkAuth = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  try {
    const user = await User.findById(req.user!._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.log("Error in checkAuth controller", errorMessage);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      username,
      email,
      password,
    }: {
      fullName: string;
      username: string;
      email: string;
      password: string;
    } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser: User_T | null = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    const existingEmail: User_T | null = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({ error: "This email is already in use" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword: string = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);

      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profilePic: newUser.profilePic,
        coverPic: newUser.coverPic,
      });
    }
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.log("Error in register controller", errorMessage);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password }: { username: string; password: string } =
      req.body;

    const user = await User.findOne({ username });
    const isPasswordCorrect: boolean = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profilePic: user.profilePic,
      coverPic: user.coverPic,
    });
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.log("Error in register controller", errorMessage);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.log("Error in register controller", errorMessage);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
