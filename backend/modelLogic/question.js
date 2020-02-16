'use strict';

/**
 * This is a Logic Class which contains all methods to performing modifications on the question data collection
 * @type {Model<Document>}
 */
const Question = require('../models/Question');

  const insertQuestions = async function(room) {

    const promises =  room.connections.map(connection => {
      let questions = Question.find({room: room.title});
        return Promise.all(
          questions.map(question => {
            if (question.answers.length !== 2) {
              question.answers.push({ email: connection.userId, own: "", guess: "" });
              return question.save();
            }
          })
        )
    });
    return Promise.all(promises);
  };

const questionPool = [{
  question: "Würdest du persönliche Nachteile auf dich nehmen um einem Freund zu helfen?",
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

/*


const getQuestionNumber = function(num, callback) {
  num = num % questionPool.length;
  return callback(null, questionPool[num]);
};
*/

module.exports = {
  insertQuestions,
  questionPool
};
