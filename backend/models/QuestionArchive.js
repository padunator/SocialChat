'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/**
 * Each connection object represents a user connected through a unique socket.
 * Each connection object composed of {userId + socketId}. Both of them together are unique.
 *
 */
const QuestionArchive = new mongoose.Schema({
  question: { type: String, required: true },
  room: {type: String},
  options: { type: [{ val: String, text: String, _id: { id: false } }]   },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('questionArchive', QuestionArchive);

