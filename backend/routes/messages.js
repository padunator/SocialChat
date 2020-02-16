const express = require("express");
const Sentiment = require('sentiment');
const router = express.Router();
const ChatMessage = require("../models/ChatMessage");
const checkAuth = require('../middleware/check-auth');
const sentiment = new Sentiment();
/**
 * Middleware for the chat route which handle chat related REST Api calls
 */
// POST request
// Protect API by using checkAuth middleware as a parameter to run as reference
router.post("", checkAuth, (req,res,next)=> {
  const message = new ChatMessage({
    username: req.body.username,
    email: req.body.email,
    timeSent: req.body.timeSent,
    message: req.body.message,
    url_matches: req.body.url_matches
  });
  // var result = sentiment.analyze(req.body.message);
  message.save().then(createdPost => {
    res.status(201).json({
      message: 'Post added!',
      postId: createdPost._id
    });
  });
});

// Get whole chat feed
router.get("", checkAuth, (req,res,next)=>{
  ChatMessage.find().then(feed => {
    res.status(200).json({
      message: 'Chatfeed fetched successfully',
      chatMessages: feed
    });
  });
});   //add a new middleware

// Delete a single chat message - Not used at the moment but could be used if user wants to delete a message
router.delete("/:id", checkAuth, (req,res,next)=>{
  ChatMessage.deleteOne({_id: req.params.id}).then( (result) => {
    console.log("Message " + req.params.id + " deleted!")
    res.status(200).json({message: 'Post deleted!'});
  });
});

module.exports = router;
