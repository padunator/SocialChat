const express = require("express");
const checkAuth = require('../middleware/check-auth');
const router = express.Router();
const Room = require('../models/Room');
const QuestionArchive = require('../models/QuestionArchive');
const Question = require('../models/Question');
const HighScore = require('../models/HighScore');
const Sentiment = require('../models/Sentiment');
const questionData = require('../data/questions_live');
const roomLogic = require('../modelLogic/room');
/**
 * Middleware for the game route which handle game related REST Api calls
 */
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

// Get list of rooms
router.get('/rooms', checkAuth, (req, res, next) => {
  Room.find().then( rooms => {
    res.status(200).json({
      message: 'Room found!',
      room: rooms
    });
  })
});

// Get current questions for a specific room
router.get("/getQuestions/:title",  (req, res, next) => {
  Question.find({room: req.params.title}).then( fetchedQuestions => {
    res.status(200).json({
      message: 'Questions fetched!',
      questions: fetchedQuestions
    });
  }).catch(err => {
    console.error('Game Route - Get Question: ERROR when fetching Questions! ERROR : ' + err);
  });
});

// Create a new room and load 20 randomized questions from the question pool
router.post('/createRoom', checkAuth, async (req, res, next) => {
  const room = new Room({title: req.body.room.title});
  const newRoom = await room.save();
  // Insert Question Archive into the DB (only at first execution needed)
  await QuestionArchive.insertMany(questionData.questionPool);
  // Get 20 random questions out of the existing Question Archive Collection and assign Room Number
  const selectedQuestions = await QuestionArchive.aggregate( [ { $sample: { size: 20 } } ]);
  selectedQuestions.forEach(question => {
    question.room = req.body.room.title;
  });
  // Insert the random questions into the Question Collection
  Question.insertMany(selectedQuestions).then(inserted => {
    res.status(201).json({
      message: 'New Room created!',
      result: newRoom
    });
  }).catch(error => {
    console.error('Post CreateRoom - Question insertion error: ' + error);
  });
});

// Calculate final High Score and semantic score per user and save it in the related connection of the room
router.post('/createHighScore', checkAuth, (req, res, next) => {
  let totalScore = 0;
  let tokenCount = 0;
  let totalComparative = 0;

  Sentiment.find({user: req.body.user}).then((sentiments) => {
    sentiments.forEach(sentiment => {
      tokenCount += sentiment.tokens.length;
      totalScore += sentiment.score;
    });
    totalComparative = totalScore / tokenCount;
    roomLogic.updateConnections({
      roomID: req.body.roomID,
      email: req.body.user,
      round: req.body.round,
      duration: req.body.duration,
      score: req.body.score,
      words: tokenCount,
      comparative: totalComparative
    }).catch(err => {console.error('Game Route - Create High Score : ' + err)});
  });

  const newHighScore = new HighScore ({
    user: req.body.user,
    score: req.body.score,
    duration: req.body.duration
  });
  newHighScore.save().then((rec) => {
    HighScore.find({}).sort({score: -1}).exec().then((scores) => {
      res.status(201).json({
        message: 'High Score saved!',
        scores: scores
      });
    });
  });
});

// Get list of all high scores
router.get('/getHighScores', checkAuth, (req, res, next) => {
  HighScore.find({}).then((scores) => {
    res.status(201).json({
      scores: scores
    });
  });
});

// Get specific room
router.get('/:id', checkAuth, (req, res, next) => {
  const roomId = req.params.id;
  Room.findById(roomId).then(room => {
    res.status(200).json({
      room: room
    });
  }).catch(err => console.error('Room not found ! ' + err));
});

module.exports = router;
