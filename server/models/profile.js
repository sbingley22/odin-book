const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ProfileSchema = new Schema({
  firstname: { type: String, required: true, maxLength: 30 },
  lastname: { type: String, required: true, maxLength: 30 },
  about: { type: String, maxLength: 200 },
  interests: { type: String, maxLength: 200 },
  image: { type: String, default: "https://static.vecteezy.com/system/resources/previews/020/765/399/non_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg" }
})

module.exports = mongoose.model("Profile", ProfileSchema)