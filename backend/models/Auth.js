'use strict';
/**
 * This is the Server Side model for the authentication data MongoDB - collection
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require ("mongoose-unique-validator");

const authSchema = mongoose.Schema({
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
});

authSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Auth', authSchema);
