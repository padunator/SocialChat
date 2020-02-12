'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HighScoreSchema = new mongoose.Schema({
  user: { type: String, required: true },
  score: {type: Number, required: true},
  duration: {type: String, required: true},
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('highScore', HighScoreSchema);
