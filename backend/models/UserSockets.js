
const mongoose = require('mongoose');
const uniqueValidator = require ("mongoose-unique-validator");

const userSocket =  mongoose.Schema({
  socket: {type: String},
  email: {type: String, required: true, unique: true}
});

userSocket.plugin(uniqueValidator);
module.exports = mongoose.model('Sockets', userSocket);
