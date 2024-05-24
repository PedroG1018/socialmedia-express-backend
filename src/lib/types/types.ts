import { Request } from "express";

export interface User_T {
  _id: string;
  fullName: string;
  username: string;
  password: string;
  email: string;
  followers: User_T[];
  following: User_T[];
  profilePic: string;
  coverPic: string;
  bio: string;
  links: string[];
  likedPosts: Post_T[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment_T {
  _id: string;
  user: User_T;
  parentPostId: Post_T[];
  text: string;
  likes: User_T[];
  childComments: Comment_T[];
  parentComments: Comment_T[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Post_T {
  _id: string;
  user: User_T;
  text: string;
  img: string;
  likes: User_T[];
  comments: Comment_T[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IGetUserAuthInfoRequest extends Request {
  user?: Record<string, any>;
}
