'use strict';

/**
 * This is the Socket connection endpoint which is listening on the certain namespaces to execute the corresponding
 * logic when event is emitted on the client side.
 * The results are then sent back to the clients by using the event name of the so called socket-event-listeners
 * which are defined in the corresponding service-classes.
 * Occurring events mostly execute a predefined logic in the the OnInit Method of the corresponding Component
 * @type {module:http}
 */
const http = require("http");
const socketIO = require('socket.io');
const Sockets = require('../models/UserSockets');
const Room = require('../models/Room');
const QuestionArchive = require('../models/QuestionArchive');
const Question = require('../models/Question');
const User = require('../models/User');
const roomLogic = require('../modelLogic/room');
const sentimentModel = require('../models/Sentiment');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
const util = require('util');

/**
 * Centralize all receiving / emitting socket connections
 * Implement corresponding logic for any event
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
        io.of('/chat').emit("ChatMessage", message);
      });
    });

    socket.on('changeStatus', status => {
      io.of('/chat').emit('userLogged',  {email: status.email, status: status.status});
    });

    socket.on('login', (email) => {
      Sockets.updateOne({email: email}, {socket: socket.id}, { upsert: true })
        .catch(err => {console.error('Socket Login: Error when updating socket connection ' + err);});
    });

    socket.on('logout', (user) => {
      Sockets.deleteOne({email: user.email})
        .catch(err => {console.error('Socket Logout: Error when deleting socket connection  ' + err);});
    });

    // Send game request for creating new room
    socket.on('sendGameRequest', (req) => {
      Sockets.findOne({email: req.to}).then(foundSocket => {
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
    socket.on('disconnect', () => {
      Sockets.findOne({socket: socket.id}).then(user => {
        User.updateOne({email: user.email}, {status: false})
            .then( () => io.of('/chat').emit('userLogged',  {email: user.email, status: false}));
      }).catch(err => console.error('Disconnect: Socket not found at disconnect!'));
    });
  });

  // Game namespace
  io.of('/game').on('connection', function(socket) {
    console.log('Game Socket connected on server');
    // Create a new room UPDATE
    socket.on('createRoom', async (title) => {
      let room = await Room.findOne({title: title});

      if (room) {
        socket.emit('updateRoomsList', { error: 'Room title already exists.' });
      }else {
        const room = new Room({title: title});
        room.save().catch(err => console.error(err));
      }
    });

    // Join a Gameroom
    socket.on('join', async function(obj,ack){
      // let room = await Room.findOne({title: obj.title});
      let room = await  Room.findOne({title: obj.title});
        // Push a new connection object(i.e. {userId + socketId})
      if (room.noOfPlayers > room.connections.length) {
        room.connections.push({
          userId: obj.userId,
          socketId: socket.id,
          round: obj.round,
          duration: obj.duration,
          score: obj.score,
          words: 0,
          comparative: 0
        });
      }

        room = await room.save();
        socket.join(room.title);
        socket.username = obj.userId;

        // Join the room channel
        if (room.noOfPlayers === room.connections.length) {
          room.isOpen = false;
          room = await room.save();

          Promise.all(
            room.connections.map(connection => {
              return Question.find({room: room.title}).then(questions => {
                 return Promise.all(
                  questions.map(question => {
                    if (question.answers.length !== 2) {
                      question.answers.push({ email: connection.userId, own: "", guess: "" });
                      return question.save();
                    }
                  })
                )
              });
            })
          ).then(() => {
            io.of("/game")
              .in(room.title)
              .emit("GameReady", true);
            ack(false);
          })
        } else {
          ack(true);
          return Promise.resolve();
        }
      // }
    });

    // Registering new Question response
    socket.on('new-game-response', (obj) => {
      // Update Room-Connections with Game-Related Data of current running game
      Room.updateOne({title: obj.roomID,'connections.userId': obj.email}, {'$set': {
        'connections.$.round': obj.round,
        'connections.$.duration': obj.duration,
        'connections.$.score': obj.score
      }}, {new: true}).then(updatedConn => {
      }).catch(err => console.error('Error while updating connections for running game ' + err));

      // Update Question Collection with Game-Related answers of current running game
       const own = obj.question.answers.find(s => s.email===obj.email).own;
       const guess = obj.question.answers.find(s => s.email===obj.email).guess;
       Question.updateOne({_id: obj.question._id, 'answers.email': obj.email}, {'$set': {
          'answers.$.own': own,
          'answers.$.guess': guess
        }}, { new: true })
         .then(updatedAnswer=> {
           socket.broadcast.to(obj.roomID).emit('PlayerAnswered', {
          email: obj.email,
          own: own,
          guess: guess
        });
       });
    });

    // Inform the opponent of the updated question
    socket.on('update-question', (question) => {
      const newQuestion = new QuestionArchive ({
        question : question.question.question,
        options: question.question.options,
        room: question.question.room,
        createdAt: question.question.createdAt
      });
      newQuestion.save().then((qn) => {
        socket.broadcast.to(question.roomID).emit('joker-selected', question);
      });
    });

    // Inform the opponent about the Joker selection to prevent simultaneous usage
    socket.on('informOpponent', (joker) => {
      socket.broadcast.to(joker.roomID).emit('notifyOpponent', joker.selected);
    });

    // When a user leaves a running Game
    socket.on('leaveGame', (room) => {
      removeUserFromGame(socket, room)
    });

    // When a socket exits or refreshes the Page
    socket.on('disconnect', () => {
      console.log('Disconnecting game socket...')
      // removeUserFromGame(socket);
    });
  });
};

// Logic to remove the user of the corresponding socket from a given room
const removeUserFromGame = (socket, room) => {
  roomLogic.removeUser(socket, room)
    .then((response) =>{
    socket.leave(response.room.title);
      response.room.isOpen = true;
      response.room.save();
    socket.broadcast.to(response.room.title).emit('removeUser', response.user);
  })
    .catch(err => { console.error(err)});
};

/**
 * Initialize socket connection and server
 *
 */
let init = function(app) {
  // Create server
  const server = http.createServer(app);
  // Initialize sockets on server
  const io = socketIO(server);

  // Call events
  ioEvents(io);
  return server;

};


module.exports = init;
