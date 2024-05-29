import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate({
      path: "user",
      select: "-password",
    });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: "Internal server error" });
    console.log("Error in getAllPosts controller:", errorMessage);
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    const following = user.following;

    const followingPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" });

    res.status(200).json(followingPosts);
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: "Internal server error" });
    console.log("Error in getFollowingPosts controller:", errorMessage);
  }
};

export const getUsersPosts = async (req, res) => {
  try {
    const username = req.params.username;

    const user = await User.findOne({ username: username });

    if (!user) return res.status(404).json({ error: "User not found" });

    const usersPosts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" });

    if (usersPosts.length === 0) return res.status(200).json([]);

    res.status(200).json(usersPosts);
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: "Internal server error" });
    console.log("Error in getUsersPosts controller:", errorMessage);
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    const likedPosts = await Post.find({
      _id: { $in: user.likedPosts },
    }).populate({ path: "user", select: "-password" });

    res.status(200).json(likedPosts);
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: "Internal server error" });
    console.log("Error in getLikedPosts controller:", errorMessage);
  }
};

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;

    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (!text && !img)
      return res.status(400).json({ error: "Post must have text or image" });

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text: text,
      img: img,
    });

    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: "Internal server error" });
    console.log("Error in createPost controller:", errorMessage);
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;

    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: "Post not found" });

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );

      res.status(200).json(updatedLikes);
    } else {
      // Like post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });

      await notification.save();

      const updatedLikes = post.likes;

      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: "Internal server error" });
    console.log("Error in likeUnlikePost controller:", errorMessage);
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id.toString();
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) return res.status(400).json({ error: "Post not found" });

    if (post.user.toString() !== userId.toString())
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this post" });

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroyer(imgId);
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted succesfully" });
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: "Internal server error" });
    console.log("Error in deletePost controller:", errorMessage);
  }
};
