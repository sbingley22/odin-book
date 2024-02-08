const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: { type: String, required: true, maxLength: 25 },
  password: { type: String, required: true, maxLength: 100 },
  firstname: { type: String, required: true, maxLength: 30 },
  lastname: { type: String, required: true, maxLength: 30 },
  profile: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  threads: [{ type: Schema.Types.ObjectId, ref: 'Thread' }]
})

module.exports = mongoose.model("User", UserSchema)