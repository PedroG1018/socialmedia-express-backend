import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getPostsComments = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: "Post not found" });

    const comments = await Comment.find({
      parentPostId: postId,
      parentCommentId: undefined,
    }).sort({
      createdAt: -1,
    });

    // post has no comments
    if (comments.length === 0) return res.status(200).json([]);

    for (const comment of comments) {
      const queue = [comment];

      while (queue.length > 0) {
        const current = queue.shift();

        if (!current) continue;

        await current.populate({ path: "childComments" });

        for (const child of current.childComments) {
          queue.push(child);
        }
      }
    }

    res.status(200).json(comments);
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in getPostsComments controller:", errorMessage);
  }
};

export const getLikedComments = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    const likedComments = await Comment.find({
      _id: { $in: user.likedComments },
    }).populate({
      path: "user",
      select: "-password",
    });

    res.status(200).json(likedComments);
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in getLikedComments controller:", errorMessage);
  }
};

export const createComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;
    const { text, commentId } = req.body;

    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: "Post not found" });

    let newComment = null;

    if (commentId) {
      const comment = await Comment.findById(commentId);

      if (!comment) return res.status(404).json({ error: "Comment not found" });

      newComment = new Comment({
        user: userId,
        parentPostId: postId,
        parentCommentId: commentId,
        text: text,
      });
    } else {
      newComment = new Comment({
        user: userId,
        parentPostId: postId,
        text: text,
      });
    }

    const createdComment = await newComment.save();

    if (commentId) {
      await Comment.findByIdAndUpdate(commentId, {
        $push: { childComments: createdComment._id },
      });
    }

    res.status(201).json(newComment);
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in createComment controller:", errorMessage);
  }
};

export const likeUnlikeComment = async (req, res) => {
  try {
    console.log("hey");
    const userId = req.user._id;
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId);

    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const userLikedComment = comment.likes.includes(userId);

    if (userLikedComment) {
      // Unlike comment
      await Comment.updateOne({ _id: commentId }, { $pull: { likes: userId } });
      await User.updateOne(
        { _id: userId },
        { $pull: { likedComments: commentId } }
      );

      const updatedLikes = comment.likes.filter(
        (id) => id.toString() !== userId.toString()
      );

      res.status(200).json(updatedLikes);
    } else {
      // like comment
      comment.likes.push(userId);
      await User.updateOne(
        { _id: userId },
        { $push: { likedComments: commentId } }
      );
      await comment.save();

      const notification = new Notification({
        from: userId,
        to: comment.user,
        type: "comment",
      });

      await notification.save();

      const updatedLikes = comment.likes;

      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in likeUnlikeComment controller:", errorMessage);
  }
};

export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id.toString();

    const comment = await Comment.findById(commentId);

    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.user.toString() !== req.user._id.toString())
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this comment" });

    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    let errorMessage = "Something went wrong";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in deleteComment controller:", errorMessage);
  }
};
