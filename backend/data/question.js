'use strict';

// var questionModel = require('../database').models.question;

var questionPool = [{
  question: "What is this One?",
  options: { A: "option A", B: "option B", C: "option C", D: "option D" }
}, {
  question: "What is this Two?",
  options: { A: "option A", B: "option B", C: "option C", D: "option D" }
}, {
  question: "What is this Three?",
  options: { A: "option A", B: "option B", C: "option C", D: "option D" }
}, {
  question: "What is this Four?",
  options: { A: "option A", B: "option B", C: "option C", D: "option D" }
}, {
  question: "What is this Five?",
  options: { A: "option A", B: "option B", C: "option C", D: "option D" }
}];

var getQuestionNumber = function(num, callback) {
  num = num % questionPool.length;
  return callback(null, questionPool[num]);
}

module.exports = {
  getQuestionNumber
};
