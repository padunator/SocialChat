'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/**
 * This is the Server Side model for the QuestionArchive MongoDB - collection
 * This collection represents the question pool which is initially loaded from the questions_pool array, defined
 * inside the quetsions_live data object
 */

const QuestionArchive = new mongoose.Schema({
  question: { type: String, required: true },
  room: {type: String},
  options: { type: [{ val: String, text: String, _id: { id: false } }]   },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('questionArchive', QuestionArchive);

