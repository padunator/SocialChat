'use strict';

const mongoose = require('mongoose');

const DEFAULT_ROUNDS = 20;
const DEFAULT_PLAYERS = 2;

/**
 * This is the Server Side model for the Room MongoDB - collection
 */

const RoomSchema = new mongoose.Schema({
  title: {type: String, required: true},
  connections: {
    type: [{
      userId: String, socketId: String, round: Number, duration: String,
      score: Number, words: Number, comparative: Number,
    }]
  }, //  _id: { id: false }
  isOpen: {type: Boolean, default: true},
  owner: {type: {userId: String, socketId: String}},
  rounds: {type: Number, default: DEFAULT_ROUNDS},
  noOfPlayers: {type: Number, default: DEFAULT_PLAYERS},
  createdAt: {type: Date, default: Date.now},

}, {usePushEach: true});

module.exports = mongoose.model('room', RoomSchema);
