const mongoose = require('mongoose');
const plm = require("passport-local-mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/Edusavvvy");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  }],
  profileimage: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  username: String,
  userType: {
      type: String,
      enum: ['Farmer', 'Retailer']
  },
  branch: {
    type: String, // Store branch name as a string
    required: true 
  },

  bio: {
    type: String,
    required: false
  }
});


userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);

