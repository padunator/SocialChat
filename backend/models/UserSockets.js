'use strict';

const mongoose = require('mongoose');
const uniqueValidator = require ("mongoose-unique-validator");

/**
 * This is the Server Side model for the UserSocket MongoDB - collection
 * This Data Object is updated at any Connection or Refresh to have a persistent socket connection
 * and guarantee a stable connection
 */

const userSocket =  mongoose.Schema({
  socket: {type: String},
  email: {type: String, required: true, unique: true}
});

userSocket.plugin(uniqueValidator);
module.exports = mongoose.model('Sockets', userSocket);
