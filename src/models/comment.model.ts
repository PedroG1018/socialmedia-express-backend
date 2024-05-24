import mongoose, { mongo } from "mongoose";

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  parentPostId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
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
  childComments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: [],
    },
  ],
  parentComments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: [],
    },
  ],
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
