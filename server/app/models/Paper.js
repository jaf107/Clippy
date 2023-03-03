// npm packages
const mongoose = require("mongoose");
// globals
const paperSchema = new mongoose.Schema({
  paper_id: {
    type: String,
  },
  title: {
    type: String,
  },
  user_id: {
    type: String,
    ref: "User",
    // required: true,
  },
  knowledge_graph: {
    type: String,
  },
  abstract: {
    type: String,
  },
  abstractive_summary: {
    type: Object,
  },
  extractive_summary: {
    type: Object,
  },
  url: {
    type: String,
  },
  citationCount: {
    type: Number,
  },
  referenceCount: {
    type: Number,
  },
  authors: [
    {
      type: Object,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Paper", paperSchema);
