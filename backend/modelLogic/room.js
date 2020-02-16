'use strict';
const Room = require('../models/Room');
const User = require('../models/User');

/**
 * This is a Logic Class which contains all methods to perform modifications on the room data collection
 * @type {Model<Document>}
 */

const updateConnections = async (obj) => {
  // Update Room-Connections with Game-Related Data of current running game
  await Room.updateOne({title: obj.roomID,'connections.userId': obj.email}, {'$set': {
      'connections.$.round': obj.round,
      'connections.$.duration': obj.duration,
      'connections.$.score': obj.score,
      'connections.$.words': obj.words,
      'connections.$.comparative': obj.comparative
    }}, {new: true})
    .then(() => {  return 'Connection updated'; });
};

const  getUsers = (room, callback) => {
  let users = [], vis = {}, count = 0;
  room.connections.forEach((conn) => {
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
const removeUser =  async (socket, room) => {

  let userId = socket.username;
  let currRoom = await Room.findOne({title: room});
  for (const [i, connection] of currRoom.connections.entries()) {
  // currRoom.connections.forEach( async (connection, i) => {
    let target = 0,
      pass = true;
    if (connection.socketId === socket.id) {
      pass = false, target = i;
    }
    // 2. Check if the current room has the disconnected socket,
    // If so, then, remove the current connection object, and terminate the loop.
    if (!pass) {
      await currRoom.connections.id(currRoom.connections[target]._id).remove();
      const updRoom = await currRoom.save();
      const user = await User.findOne({email: userId});
      return ({
        room: updRoom,
        user: user
      });
    }
  }
};

module.exports = {
  getUsers,
  removeUser,
  updateConnections
};
