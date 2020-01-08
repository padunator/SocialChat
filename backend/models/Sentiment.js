const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sentimentSchema = mongoose.Schema({
  score: {type: Number, required: true, unique: true},
  comparative: {type: Number, required: true},
  calculation: {type: [{key: String, value: Number}], _id: { id: false }, required: true},
  tokens: { type: [String], required: true},
  words: { type: [String], required: true},
  positive: { type: [String], required: true},
  negative: { type: [String], required: true},
});


module.exports = mongoose.model('Sentiment', sentimentSchema);