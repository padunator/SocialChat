'use strict';

const mongoose = require('mongoose');

var DEFAULT_ROUNDS = 10;
var DEFAULT_PLAYERS = 2;
/**
 * Each connection object represents a user connected through a unique socket.
 * Each connection object composed of {userId + socketId}. Both of them together are unique.
 *
 */
var RoomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  connections: { type: [{ userId: String, socketId: String, round: Number, duration: Number,
      score: Number, words: Number, comparative: Number, }] }, //  _id: { id: false }
  isOpen: { type: Boolean, default: true },
  owner: { type: { userId: String, socketId: String } },
  rounds: { type: Number, default: DEFAULT_ROUNDS },
  currentRound: { type: Number, default: 0 },
  noOfPlayers: { type: Number, default: DEFAULT_PLAYERS },
  createdAt: { type: Date, default: Date.now },

}, { usePushEach: true });

module.exports = mongoose.model('room', RoomSchema);
