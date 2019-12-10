'use strict';
const Room = require('../models/Room');
const User = require('../models/User');

/**
 * Increment Current round of a room.
 *
 */
var incCurrentRound = function(room, callback) {
  if (room.currentRound < room.rounds) {
    room.currentRound++;
    room.score.push({ round: room.currentRound, answers: {} })
    room.save(function(err){
      callback(null, room);
    });
  }
};

/**
 * Get all users in a room
 *
 */
var getUsers = function(room, socket, userId, callback) {
  console.log('In getUsers');
  var users = [], vis = {}, count = 0;


  // Loop on room's connections, Then:
  room.connections.forEach(function(conn) {

    // 2. Create an array(i.e. users) contains unique users' ids
    if (!vis[conn.userId]) {
      count++;
      users.push(conn.userId);
    }
    vis[conn.userId] = true;
  });

  // Loop on each user id, Then:
  // Get the user object by id, and assign it to users array.
  // So, users array will hold users' objects instead of ids.
  users.forEach(function(userId, i) {
    console.log('FOR EACH USER TRY with id ' + userId + 'and i = ' + i);
    User.findOne({email: userId}).then(user => {
      users[i] = user;
      console.log('Users length ' + users.length + 'and i = ' + i);
      if (i + 1 === users.length) {
        console.log('RETURNING CALLBACK IN users.forEach with cunut == ' + count);
        return callback(null, users, count);
      }
    }).catch(err => {return callback(err); });
  });
};

/**
 * Remove a user along with the corresponding socket from a room
 *
 */
var removeUser = function(socket, callback) {

  // Get current user's id
  var userId = socket.username;

  Room.find({}).then( rooms => {
    // For every room,
    // 1. Count the number of connections of the current user(using one or more sockets).
    rooms.map(room => {
      room.connections.forEach(function(connection, i) {
        let pass = true,
          cunt = 0,
          target = 0;
        if (connection.userId === userId) {
          cunt++;
        }
        if (connection.socketId === socket.id) {
          pass = false, target = i;
        }

        // 2. Check if the current room has the disconnected socket,
        // If so, then, remove the current connection object, and terminate the loop.
        if (!pass) {
          room.connections.id(room.connections[target]._id).remove();
          room.save(function(err) {
            callback(err, room, userId, cunt);
          });
        }

        return pass;
      });
    });
  });
};

module.exports = {
  getUsers,
  removeUser,
  incCurrentRound
};
