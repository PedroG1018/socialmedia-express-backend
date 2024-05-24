import User from "../models/user.model";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User_T } from "../lib/types/types";

interface IJwtPayload extends JwtPayload {
  userId: string;
}

interface IGetUserAuthInfoRequest extends Request {
  user?: Record<string, any>;
}

export const protectRoute = async (
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IJwtPayload;

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized: Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    let errorMessage = "Something went wrong";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.log("Error in protectRoute middleware", errorMessage);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
