'use strict';

const http = require("http");
const socketIO = require('socket.io');
const Sockets = require('../models/UserSockets');
const Room = require('../models/Room');
const Question = require('../models/Question');
const User = require('../models/User');
const roomLogic = require('../modelLogic/room');
const sentimentModel = require('../models/Sentiment');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();


/**
 * Encapsulates all code for emitting and listening to socket events
 *
 */

const ioEvents = function(io) {

  // Chat namespace
  io.of('/chat').on('connection', (socket) => {
    console.log('Chat Socket connected on server');

    socket.on('new-message', (message) => {
      let result = sentiment.analyze(message.message);
      const newSentiment = new sentimentModel({
        user: message.email,
        score: result.score,
        comparative: result.comparative,
        calculation: result.calculation,
        tokens: result.tokens,
        words: result.words,
        positive: result.positive,
        negative: result.negative
      });
      newSentiment.save().then(() => {
        console.dir(result);
        io.of('/chat').emit("ChatMessage", message);
      });
    });

    socket.on('changeStatus', status => {
      console.log('CHANGE STATUS EMIT: SENDING BACK TO CLIENTS FROM ' + status.email);
      io.of('/chat').emit('userLogged',  {email: status.email, status: status.status});
      // io.emit('userLogged', {email: status.email, status: status.status});
      // io.broadcast.emit('userLogger', {email: status.email, status: status.status});
    });

    socket.on('login', (email) => {
      const userSocket = new Sockets({
        socket: socket.id,
        email: email
      });
      Sockets.updateOne({email: email}, {socket: socket.id}, { upsert: true }).then(result => {
        console.log('SOCKET LOGIN: SOCKET UPDATED FOR ' + email);
      });
    });

    socket.on('logout', (user) => {
      Sockets.deleteOne({email: user.email}).then( () => {
        console.log('SOCKET LOGOUT: SOCKET DELETED');
      });
    });

    // Send game request for creating new room
    socket.on('sendGameRequest', (req) => {
      Sockets.findOne({email: req.to}).then(foundSocket => {
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

    // When a socket exits set user status to offline
    socket.on('disconnect', function() {
      Sockets.findOne({socket: socket.id}).then(user => {
        User.updateOne({email: user.email}, {status: false})
            .then( () => io.of('/chat').emit('userLogged',  {email: user.email, status: false}));
      }).catch(err => console.log('Disconnect: Socket not found at disconnect!'));
    });
  });

  // gameroom namespace
  io.of('/game').on('connection', function(socket) {
    console.log('Game Socket connected on server');
    // Create a new room UPDATE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    socket.on('createRoom', (title) => {
      Room.findOne({title: title}).then(room => {
        if (room) {
          socket.emit('updateRoomsList', { error: 'Room title already exists.' });
        }else {
          const room = new Room({title: title});
          room.save().then(newRoom => {
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
          if (room.noOfPlayers <= room.connections.length) {
            socket.emit('updateUsersList', { error: 'Room is Full. Try again later' });
          } else {
            // Push a new connection object(i.e. {userId + socketId})
            room.connections.push({userId: obj.userId, socketId: socket.id, round: 0, duration: 0, score: 0, words: 0, comparative: 0});
            room.save().then(room => {
              socket.join(room.title);
              socket.username = obj.userId;

              // Join the room channel
              if (room.noOfPlayers === room.connections.length) {
                room.isOpen = false;
                room.save().then(room => {
                  Promise.all(
                    room.connections.map(connection => {
                      return Question.find({room: room.title}).then(questions => {
                         return Promise.all(
                          questions.map(question => {
                            if (question.answers.length !== 2) {
                              question.answers.push({ email: connection.userId, own: "", guess: "" });
                              return question.save();
                            }
                          }),
                        )
                      });
                    })
                  ).then(() => {
                    io.of("/game")
                      .in(room.title)
                      .emit("GameReady", true);
                    ack(false);
                  })
/*                  room.connections.forEach(connection => {
                    Question.find({room: room.title}).then(questions => {
                      Promise.all(
                        questions.map(question => {
                          console.log('NOW PUSHING ANSWERS WITH LENGTH OF ' + question.answers.length.toString());
                          if (question.answers.length !== 2) {
                            question.answers.push({ email: connection.userId, own: "", guess: "" });
                            console.log('SAVE ANSWER');
                            return question.save();
                          }
                        }),
                      ).then(() => {
                        // All questions have been saved. Do the next thing.
                        // Sending GameReady to both players in room! Both players are opening the
                        // Page at the same time!
                        io.of("/game")
                          .in(room.title)
                          .emit("GameReady", true);
                        ack(false);
                      });
                    });
                  });*/
                });
              } else {
                ack(true);
                return Promise.resolve();
              }
            });
          }
      }).
      catch(err => {
          socket.emit('updateUsersList', { error: err });
      });
    });

    // Registering new Question response
    socket.on('new-game-response', (obj) => {
      // Update Room-Connections with Game-Related Data of current running game
      Room.updateOne({title: obj.roomID,'connections.userId': obj.email}, {'$set': {
        'connections.$.round': obj.round,
        'connections.$.duration': obj.duration,
        'connections.$.score': obj.score
      }}, {new: true}).then(updatedConn => {
        console.log('Connection updated!');
      }).catch(err => console.log('Error while updating connections for running game ' + err));

      // Update Question Collection with Game-Related answers of current running game
       const own = obj.question.answers.find(s => s.email===obj.email).own;
       const guess = obj.question.answers.find(s => s.email===obj.email).guess;
      Question.updateOne({_id: obj.question._id, 'answers.email': obj.email}, {'$set': {
          'answers.$.own': own,
          'answers.$.guess': guess
        }}, { new: true }).then(updatedAnswer=> {
        socket.broadcast.to(obj.roomID).emit('PlayerAnswered', {
          email: obj.email,
          own: own,
          guess: guess
        });
      });
    });

    // Inform the opponent of the updated question
    socket.on('update-question', (question) => {
      const newQuestion = new Question ({
        question : question.question.question,
        options: question.question.options,
        room: question.question.room,
        answers: question.question.answers,
        createdAt: question.question.createdAt
      });
      newQuestion.save().then((qn) => {
        socket.broadcast.to(question.roomID).emit('joker-selected', question);
      });
    });
    // When a user leaves a running Game
    socket.on('leaveGame', () => {
      removeUserFromGame(socket)
    });

    // When a socket exits or refreshes the Page
    socket.on('disconnect', function() {
      removeUserFromGame(socket);
    });

    socket.on('playerMovement', (movementData) => {
      Room.findOne({title: movementData.title}).then(room => {
        room.players[socket.id].x = movementData.x;
        room.players[socket.id].y = movementData.y;
        room.players[socket.id].rotation = movementData.rotation;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', room.players[socket.id]);
      });
    });

    socket.on('starCollected',  (room) => {
      Room.findOne({title: room}).then(room => {
        if (room.players[socket.id].team === 'red') {
          scores.red += 10;
        } else {
          scores.blue += 10;
        }
        star.x = Math.floor(Math.random() * 700) + 50;
        star.y = Math.floor(Math.random() * 500) + 50;
        io.emit('starLocation', star);
        io.emit('scoreUpdate', scores);
      });
    });


    /*   console.log('DISCONNECTING SOCKET');
       console.log(socket.username);
       // Find the room to which the socket is connected to,
       // and remove the current user + socket from this room
       roomLogic.removeUser(socket, function(err, room, user, cuntUserInRoom) {
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
           console.log('DISCONNECT: REMOVING FOLLOWING USER FROM LIST  ');
           console.log(user);
           socket.broadcast.to(room.title).emit('removeUser', user);
         }
       });*/
      /*    socket.on('updateUserList', (gameData) => {
         console.log('SENDING UPDATE USER BACK TO SENDER');
         User.findOne({email: gameData.email}).then( user => {
           console.log('USER FOUND NOW SEND BROADCAST FOR ROOM ' + gameData.room);
           socket.broadcast.to(gameData.room).emit('updateUsersList', user);
         });
       });*/

    /*
    // When a new answer arrsives
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

const removeUserFromGame = function(socket) {
  console.log('REMOVE USER ' + socket.username);
  // Find the room to which the socket is connected to,
  // and remove the current user + socket from this room
  roomLogic.removeUser(socket, function(err, room, user, cuntUserInRoom) {
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
      console.log('REMOVE/DISCONNECT: REMOVING FOLLOWING USER FROM LIST  ');
      console.log(user);
      socket.broadcast.to(room.title).emit('removeUser', user);
    }
  });
};

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

};


module.exports = init;
