// npm packages
const mongoose = require("mongoose");
// globals
const paperSchema = new mongoose.Schema({
  // user_id: {
  //   type: String,
  //   ref: "User",
  //   required: true,
  // },
  public_id: {
    type: String,
  },
  url: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Paper", paperSchema);
