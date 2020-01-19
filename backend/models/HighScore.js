'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var HighScoreSchema = new mongoose.Schema({
  user: { type: String, required: true },
  score: {type: Number, required: true},
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('highScore', HighScoreSchema);
