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
      score: Number, words: Number, comparative: Number, _id: { id: false } }] },
  // players: { type: [{ rotation: String, x: String, y: String, playerId: String, team: String }] },
  isOpen: { type: Boolean, default: true },
  owner: { type: { userId: String, socketId: String } },
  rounds: { type: Number, default: DEFAULT_ROUNDS },
  currentRound: { type: Number, default: 0 },
  noOfPlayers: { type: Number, default: DEFAULT_PLAYERS },
  createdAt: { type: Date, default: Date.now },
  // answers: { type: [{ email: String, round: Number, duration: Number, score: String, words: String, comparative: Number,  _id: { id: false } }] },

  /*  // questions: { type: Array }
    score: {
      type: [{ round: Number, answers: Object, _id: { id: false } }],
      default: [{ round: 0, answers: {} }]
    }*/
}, { usePushEach: true });

module.exports = mongoose.model('room', RoomSchema);
