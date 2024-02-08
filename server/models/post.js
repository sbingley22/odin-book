const mongoose = require("mongoose")
const Schema = mongoose.Schema

const CommentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  comment: { type: String, required: true, maxLength: 200 }
});

const PostSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true, maxLength: 200 },
  date: { type: Date, default: Date.now },
  comments: [CommentSchema],
  likes:  [{ type: Schema.Types.ObjectId, ref: 'User' }]
})

module.exports = mongoose.model("Post", PostSchema)