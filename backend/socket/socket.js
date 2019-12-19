'use strict';

// var config = require('../config');
// var redis = require('redis').createClient;
// var adapter = require('socket.io-redis');
const http = require("http");
const socketIO = require('socket.io');
const Sockets = require('../models/UserSockets');
const Room = require('../models/Room');
const Question = require('../models/Question');
const questionLogic = require('../modelLogic/question');
const roomLogic = require('../modelLogic/room');

var TIME_INTERVAL = 10000; //25 sec

/**
 * Encapsulates all code for emitting and listening to socket events
 *
 */

var ioEvents = function(io) {

  // Chat namespace
  io.of('/chat').on('connection', (socket) => {
    console.log('Chat Socket connected on server');

    socket.on('new-message', (message) => {
      console.log('Received new message ' + message);
      io.of('/chat').emit("ChatMessage", message);
    });

    socket.on('login', (email) => {
      const userSocket = new Sockets({
        socket: socket.id,
        email: email
      });

      Sockets.updateOne({email: email}, {socket: socket.id}, { upsert: true }).then(result => {
      });
    });

    socket.on('logout', (user) => {
      Sockets.deleteOne({email: user.email});
    });

    // Send game request for creating new room
    socket.on('sendGameRequest', (req) => {
      console.log('Sending confirmation dialog to ' + req.to);
      Sockets.findOne({email: req.to}).then(foundSocket => {
        console.log('Own Socket ID ' + socket.id + ' socket-to-id ' + foundSocket.socket)
        // socket.broadcast.to(foundSocket.socket).emit("ConfirmGame", req.message);
        io.of('/chat').to(foundSocket.socket).emit("ConfirmGame", req);
      });
    });

    // Send game request for creating new room
    socket.on('joinGameRequest', (req) => {
      Sockets.findOne({email: req.from}).then(foundSocket => {
        // socket.broadcast.to(foundSocket.socket).emit("ConfirmGame", req.message);
        io.of('/chat').to(foundSocket.socket).emit("JoinGame", req);
      });
    });

  });

  // gameroom namespace
  io.of('/game').on('connection', function(socket) {
    console.log('Game Socket connected on server');

    // Create a new room
    socket.on('createRoom', (title) => {
      Room.findOne({title: title}).then(room => {
        if (room) {
          socket.emit('updateRoomsList', { error: 'Room title already exists.' });
        }else {
          const room = new Room({title: title});
          room.save().then(newRoom => {
            console.log('Room ' + title + ' created!');
            // send to current socket
            // socket.emit('updateRoomsList', newRoom);
            // send to all other sockets
            // socket.broadcast.emit('updateRoomsList', newRoom);
          }).catch(err => console.log(err));
        }
      }).catch(err => {
        console.log('Error in room creation '  + err);
      });
    });

    // Join a gameroom
    socket.on('join', function(obj,ack){
      Room.findOne({title: obj.title}).then(room => {
        if (!room) {
          // Assuming that you already checked in router that gameroom exists
          // Then, if a room doesn't exist here, return an error to inform the client-side.
          socket.emit('updateUsersList', { error: 'Room doesnt exist.' });
        } else {
          // Check if user exists in the session
          if (room.currentRound == room.rounds) {
            socket.emit('updateUsersList', { error: 'Game has ended.' });
          } else if (room.noOfPlayers <= room.connections.length) {
            socket.emit('updateUsersList', { error: 'Room is Full. Try again later' });
          } else {
            // Push a new connection object(i.e. {userId + socketId})
            // const conn = {userId: obj.userId, socketId: socket.id};
            room.connections.push({userId: obj.userId, socketId: socket.id});
            room.save().then(room => {
              console.log('JOINING TO ROOM AND PUSHING CONNECTION!');
              socket.join(room.title);
              socket.username = obj.userId;
              // Join the room channel
              if (room.noOfPlayers === room.connections.length) {
                room.isOpen = false;
                room.save().then(room => {
                  // Update Question catalog for specific room
                  room.connections.forEach(connection => {
                    Question.find({room: room.title}).then(questions => {
                      questions.forEach(question => {
                        if (question.answers.length !== 2) {
                          question.answers.push({email: connection.userId, own: "", guess: ""});
                          question.save();
                        }
                      })
                    });
                  });
                });
              }

              roomLogic.getUsers(room, socket, obj.userId,function (err, users, cuntUserInRoom)  {
                if (err) console.log('Error at roomLogic.getUsers in Socket ');

                // Return list of all user connected to the room to the current user
                socket.emit('updateUsersList', users, true);

                // Return the current user to other connecting sockets in the room
                // ONLY if the user wasn't connected already to the current room
                if (cuntUserInRoom === 1) {
                  socket.broadcast.to(room.title).emit('updateUsersList', users[users.length - 1]);
                  ack(true);
                  return Promise.resolve();
                } else{
                  // io.of(room._id).emit('GameReady', true);
                  // As second user has joined the room (this is the one which invited the first player)
                  // GameReady is sent and both users open the Game Page
                  io.of('/game').in(room.title).emit('GameReady', true);
                  // socket.emit('GameReady', true);
                  // socket.broadcast.to(room.title).emit('GameReady', true);
                  io.of('/game').in(obj.roomID).clients(function(error,clients){
                    clients.forEach(function(clients) {
                      console.log('Username: ' + clients);
                    });
                  });
                  ack(false);
                }
              });
            });
          }
        }
      });
    });

    // Registering new Question response
    socket.on('new-game-response', (obj) => {
       console.log('Updating Question answers');
       console.log('Question answers of user ' + obj.email);
       const own = obj.question.answers.find(s => s.email===obj.email).own;
       const guess = obj.question.answers.find(s => s.email===obj.email).guess;
      Question.updateOne({_id: obj.question._id, 'answers.email': obj.email}, {'$set': {
          'answers.$.own': own,
          'answers.$.guess': guess
        }}, { new: true }).then(updatedAnswer=> {
          console.log('Send response to other user ! ');
        socket.broadcast.to(obj.roomID).emit('PlayerAnswered', {
          email: obj.email,
          own: own,
          guess: guess
        });
      });
    });


    // When a socket exits
    socket.on('disconnect', function() {
      console.log('DISCONNECTING SOCKET');
      console.log(socket.username);
      // Find the room to which the socket is connected to,
      // and remove the current user + socket from this room
      roomLogic.removeUser(socket, function(err, room, userId, cuntUserInRoom) {
        if (err) throw err;

        // Leave the room channel
        socket.leave(room.id);

        // Return the user id ONLY if the user was connected to the current room using one socket
        // The user id will be then used to remove the user from users list on gameroom page
        if (cuntUserInRoom === 1) {
          if (room.currentRound >= room.rounds) {
            // delist the quiz  or take score board
            room.isOpen = false;
            room.save();
          } else {
            // room availble for new palyer
            room.isOpen = true;
            room.save();
          }
          socket.broadcast.to(room.id).emit('removeUser', userId);
        }
      });
    });

    /*
    // When a new answer arrives
    socket.on('playerAnswer', function(roomId, message) {
      var userId = message.userId;
      var user_answer = message.content;
      var correct_answer = message.correct_answer;

      Room.findById(roomId, function(err, room) {
        if (err) throw err;
        if (!room) {
          socket.emit('updateUsersList', { error: 'Room doesnt exist.' });
        } else {
          // Check if user exists in the session
          if (socket.request.session.passport == null) {
            return;
          }
          if (!room.score[room.score.length - 1].answers) {
            room.score[room.score.length - 1].answers = {};
          }
          if (room.score[room.score.length - 1].answers[userId] == undefined) {
            if (correct_answer == user_answer) {
              room.score[room.score.length - 1].answers[userId] = 3;
            } else {
              room.score[room.score.length - 1].answers[userId] = 0;
            }
            // console.log("before save : ", JSON.stringify(room), room.score[room.score.length - 1].answers, userId);
            room.save();
          }
        }
      });
    });*/
  });
};

/*var sendQuestion = function(socket, roomId) {

  Room.findById(roomId).then(room => {
    if (!room) {
      socket.emit('updateUsersList', { error: 'Room doesnt exist.' });
    } else {
      if (room.currentRound >= room.rounds) {
        // delist the quiz  or take score board
        room.isOpen = false;
        room.save();
        socket.emit('endQuiz', room);
        socket.broadcast.to(room.id).emit('endQuiz', room);
      } else {
        questionLogic.getQuestionNumber(room.currentRound, function(err, question) {
          if (err) throw err;

          socket.emit('newRoundData', question);
          socket.broadcast.to(roomId).emit('newRoundData', question);
          timer(socket, roomId);
        });
        // Room.incCurrentRound(room, function(err, newRoom) {});
      }
    }
  }).catch(err => {
    console.log('ERROR when retrieving Question Catalog!');
  });
};

var timer = function(socket, roomId) {
  setTimeout(function() {
    Room.findById(roomId, function(err, room) {
      if (err) throw err;
      if (!room) {
        socket.emit('updateUsersList', { error: 'Room doesnt exist.' });
      } else {
        Room.incCurrentRound(room, function(err, newRoom) {
          if (err) throw err;
          sendQuestion(socket, roomId);
        });
      }
    });
  }, TIME_INTERVAL); //10 sec timeout
};*/
/**
 * Initialize Socket.io
 * Uses Redis as Adapter for Socket.io
 *
 */
let init = function(app) {

  const server = http.createServer(app);
  const io = socketIO(server, {
    // transports: ['websocket']
  });

  console.log('Calling IOEvents');
  // Define all Events
  ioEvents(io);
  return server;


  // Allow sockets to access session data
  //  io.use((socket, next) => {
  //    require('../session')(socket.request, {}, next);
  //  });
}

module.exports = init;
