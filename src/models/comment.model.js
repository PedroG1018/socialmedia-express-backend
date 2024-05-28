import mongoose, { mongo } from "mongoose";

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  parentPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },

  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    required: false,
  },
  childComments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: [],
    },
  ],
  text: {
    type: String,
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
