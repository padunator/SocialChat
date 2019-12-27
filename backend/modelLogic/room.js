'use strict';
const Room = require('../models/Room');
const User = require('../models/User');

/**
 * Get all users in a room
 *
 */
// var getUsers = function(room, socket, userId, callback) {
const  getUsers = function(room, callback) {
  console.log('In getUsers');
  var users = [], vis = {}, count = 0;


  room.connections.forEach(function(conn) {

    // 2. Create an array(i.e. users) contains unique users' ids
    if (!vis[conn.userId]) {
      count++;
      users.push(conn.userId);
    }
    vis[conn.userId] = true;
  });

   const promises =  users.map(async (userId,i) => {
     users[i] = await  User.findOne({email: userId});
     return users;
    });
   Promise.all(promises).then(() => {
     return callback(null, users, count)
   });
};

/**
 * Remove a user along with the corresponding socket from a room
 *
 */
const removeUser = function(socket, callback) {

  // Get current user's id
  let userId = socket.username;
  console.log('REMOVE USER NAMED ' + userId);
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
          room.save().then(() => {
            User.findOne({email: userId})
              .then(user => {
                console.log('REMOVE USER: NOW GETTING BACK TO SOCKET WITH REMOVED USER = ');
                console.log(user);
              callback(null, room, user, cunt);
            })
              .catch(err => {
                callback(err, room, null, cunt);
              })
          });
        }
        return pass;
      });
    });
  });
};

module.exports = {
  getUsers,
  removeUser
};
