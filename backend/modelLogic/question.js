'use strict';

// var questionModel = require('../database').models.question;

var questionPool = [{
  question: "What is this One?",
  // answers: [{email: "", own: "", guess:""}],
  options: [{ val: "A", text: "option A" },
    { val: "B", text: "option B" },
    { val: "C", text: "option C" },
    { val: "D", text: "option D" }
  ]
}, {
  question: "What is this Two?",
  // answers: [{email: "", own: "", guess:""}],
  options: [{ val: "A", text: "option A" },
    { val: "B", text: "option B" },
    { val: "C", text: "option C" },
    { val: "D", text: "option D" }
  ]
}, {
  question: "What is this Three?",
  // answers: [{email: "", own: "", guess:""}],
  options: [{ val: "A", text: "option A" },
    { val: "B", text: "option B" },
    { val: "C", text: "option C" },
    { val: "D", text: "option D" }
  ]
}, {
  question: "What is this Four?",
  // answers: [{email: "", own: "", guess:""}],
  options: [{ val: "A", text: "option A" },
    { val: "B", text: "option B" },
    { val: "C", text: "option C" },
    { val: "D", text: "option D" }
  ]
}, {
  question: "What is this Five?",
  // answers: [{email: "", own: "", guess:""}],
  options: [{ val: "A", text: "option A" },
    { val: "B", text: "option B" },
    { val: "C", text: "option C" },
    { val: "D", text: "option D" }
  ]
}];

var getQuestionNumber = function(num, callback) {
  num = num % questionPool.length;
  return callback(null, questionPool[num]);
}

module.exports = {
  getQuestionNumber,
  questionPool
};
