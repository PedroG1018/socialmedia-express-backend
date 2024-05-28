import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";

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
    console.log("Error in createComment controller:", errorMessage);
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
