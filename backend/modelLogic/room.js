'use strict';
const Room = require('../models/Room');
const User = require('../models/User');

/**
 * Get all users in a room
 *
 */
const updateConnections = async function(obj) {
  // Update Room-Connections with Game-Related Data of current running game
  await Room.updateOne({title: obj.roomID,'connections.userId': obj.email}, {'$set': {
      'connections.$.round': obj.round,
      'connections.$.duration': obj.duration,
      'connections.$.score': obj.score,
      'connections.$.words': obj.words,
      'connections.$.comparative': obj.comparative
    }}, {new: true});
  return 'Connection updated';

/*  Room.updateOne({title: obj.roomID,'connections.userId': obj.email}, {'$set': {
      'connections.$.round': obj.round,
      'connections.$.duration': obj.duration,
      'connections.$.score': obj.score,
      'connections.$.words': obj.words,
      'connections.$.comparative': obj.comparative
    }}, {new: true}).then(updatedConn => {
    console.log('Connection updated!');
    return Promise.resolve();
  }).catch(err => {
    console.log('Error while updating connections for running game ' + err);
    return Promise.reject();
  });*/
};

const  getUsers = function(room, callback) {
  let users = [], vis = {}, count = 0;


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
const removeUser =  function(socket, callback) {

  // Get current user's id
  let userId = socket.username;


  Room.find({}).then( rooms => {
    // For every room,
    // 1. Count the number of connections of the current user(using one or more sockets).


    rooms.map(room => {
      room.connections.forEach(async function(connection, i) {
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

          await room.connections.id(room.connections[target]._id).remove();
          room.save().then((room) => {
            User.findOne({email: userId})
              .then(user => {
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
  removeUser,
  updateConnections
};
