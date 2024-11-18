const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true, 
    },
    image: {
      type: String, 
      required: false, 
    },
  },
  { timestamps: true } 
);

module.exports = mongoose.model('Article', articleSchema);
