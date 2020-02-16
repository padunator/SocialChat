'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * This is the Server Side model for the HighScore MongoDB - collection
 */

const HighScoreSchema = new mongoose.Schema({
  user: { type: String, required: true },
  score: {type: Number, required: true},
  duration: {type: String, required: true},
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('highScore', HighScoreSchema);
