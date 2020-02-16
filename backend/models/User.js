'use strict';

const mongoose = require('mongoose');
const uniqueValidator = require ("mongoose-unique-validator");

/**
 * This is the Server Side model for the User MongoDB - collection
 */

const userSchema =  mongoose.Schema({
  email: {type: String, required: true, unique: true},
  username: { type: String, required: true, unique: true},
  password: {type: String, required: true},
  status: {type: Boolean, required: true}
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userSchema);
