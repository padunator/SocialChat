const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatMessageSchema = mongoose.Schema({
  email: {type: String, required: true},
  username: { type: String, required: true},
  message: {type: String, required: true},
  timeSent: {type: String, required: true}
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
