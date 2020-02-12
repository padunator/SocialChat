'use strict';

// var questionModel = require('../database').models.question;

var questionPool = [{
  question: "Würdest du persönliche Nachteile auf dich nehmen um einem Freund zu helfen?",
  options: { val: "A", text: "option A", B: "option B", C: "option C", D: "option D" }
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
},
{
  question: "What opinion do you have about drug use",
  options: { A: "I would never try it", B: "It's ok for recreational use", C: "I would tolerate just weak drugs", D: "No problem at all" }
}];

var getQuestionNumber = function(num, callback) {
  num = num % questionPool.length;
  return callback(null, questionPool[num]);
}

module.exports = {
  getQuestionNumber
};
