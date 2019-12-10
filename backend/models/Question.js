'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/**
 * Each connection object represents a user connected through a unique socket.
 * Each connection object composed of {userId + socketId}. Both of them together are unique.
 *
 */
var QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  room: {type: String},
  // ownAnswer: { type: String },
  // guessAnswer: {type: String},
  answers: { type: [{ email: String, own: String, guess: String, _id: { id: false } }] },
  options: { type: [{ val: String, text: String, _id: { id: false } }] },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('question', QuestionSchema);

// --------------Add sample questions-------------------
var add_que = function() {
  var sample = [{
    question: "Question 3 ?",
    answer: "C",
    options: [{ val: "A", text: "option A" },
      { val: "B", text: "option B" },
      { val: "C", text: "option C" },
      { val: "D", text: "option D" }
    ]
  },{
    question: "Question 4 ?",
    answer: "B",
    options: [{ val: "A", text: "option A" },
      { val: "B", text: "option B" },
      { val: "C", text: "option C" },
      { val: "D", text: "option D" }
    ]
  },{
    question: "Question 5 ?",
    answer: "D",
    options: [{ val: "A", text: "option A" },
      { val: "B", text: "option B" },
      { val: "C", text: "option C" },
      { val: "D", text: "option D" }
    ]
  },{
    question: "Question 6 ?",
    answer: "C",
    options: [{ val: "A", text: "option A" },
      { val: "B", text: "option B" },
      { val: "C", text: "option C" },
      { val: "D", text: "option D" }
    ]
  }];

  questionModel.create(sample, function(err, response) {
    console.log("Create :  ", err, response);
  });
}

// add_que();
