const express = require("express");
const checkAuth = require('../middleware/check-auth');
const router = express.Router();
const Room = require('../models/Room');
const Question = require('../models/Question');
const questionLogic = require('../modelLogic/question');
// Game Room
router.get('/:id', checkAuth, (req, res, next) => {
  const roomId = req.params.id;
  Room.findById(roomId).then(room => {
    if (!room) {
      return next();
    }
    res.status(200).json({
      room: room
    });
    // res.render('gameroom', { user: req.user, room: room });
  }).catch(err => console.log('Room not found ! ' + err));
});

//Create new Room
router.post('/new', checkAuth, (req, res, next) => {
  const newRoom = new Room({
      title: req.body.title,
      owner: req.body.owner,
    }
  );
  newRoom.save().then(createdRoom => {
    res.status(201).json({
      message: 'Room added!',
      roomId: newRoom._id
    });
  });
});

router.get('/rooms', checkAuth, (req, res, next) => {
  Room.find().then( rooms => {
    res.status(200).json({
      message: 'Room found!',
      room: rooms
    });
  })
});

router.get("/getQuestions/:title",  (req, res, next) => {
  Question.find({room: req.params.title}).then( fetchedQuestions => {
    res.status(200).json({
      message: 'Questions fetched!',
      questions: fetchedQuestions
    });
  }).catch(err => {
    console.log('ERROR when fetching Questions! ERROR : ' + err);
  });
});

router.post('/createRoom', checkAuth, (req, res, next) => {
  const room = new Room({title: req.body.room.title});
  room.save().then(newRoom => {
    console.log('Room ' + req.body.room.title + ' created!');
    // Inserting new Question Pool after new room has been created
    console.log('Before for Each of question pool!');
    questionLogic.questionPool.forEach(question => {
       console.log('Pushing email into the question array ' + req.body.email);
       question.room = req.body.room.title;
    });
    Question.remove({}).then(callback => {
      Question.insertMany(questionLogic.questionPool).then(inserted => {
        console.log('New gameroom with title ' + req.body.room.title + ' created!');
        res.status(201).json({
          message: 'New Room created!',
          result: newRoom
        });
      });
    });
    // send to current socket
    // socket.emit('updateRoomsList', newRoom);
    // send to all other sockets
    // socket.broadcast.emit('updateRoomsList', newRoom);
  });
});

router.post('/addUser/:id', checkAuth, (req, res, next) => {
  const room = Room.findById(id);
  var conn = { userId: userId, socketId: socket.id };
  room.connections.push(conn);
  // const connection =
  newRoom.save().then(createdRoom => {
    res.status(201).json({
      message: 'Room added!',
      roomId: newRoom._id
    });
  });
});

module.exports = router;