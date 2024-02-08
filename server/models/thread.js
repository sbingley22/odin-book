const mongoose = require("mongoose")
const Schema = mongoose.Schema

const MessageSchema = new Schema({
  name: { type: String, required: true },
  msg: { type: String, required: true }
});

const ThreadSchema = new Schema({
  title: { type: String, required: true, maxLength: 25 },
  date: { type: Date, default: Date.now },
  messages: [MessageSchema]
})

module.exports = mongoose.model("Thread", ThreadSchema)