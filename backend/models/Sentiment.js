'use strict';

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * This is the Server Side model for the Sentiments MongoDB - collection
 * This collection is actually created out of any sentence through the Sentiment NPM and
 * is a framework which calculates the actual sentiment / comparative to analyze the sentiment of any sent sentence
 */

const sentimentSchema = mongoose.Schema({
  user: {type: String, required: true},
  score: {type: Number, required: true},
  comparative: {type: Number, required: true},
  calculation: {type: [Map], _id: { id: false }, required: true},
  tokens: { type: [String], required: true},
  words: { type: [String], required: true},
  positive: { type: [String], required: true},
  negative: { type: [String], required: true},
});


module.exports = mongoose.model('Sentiment', sentimentSchema);
