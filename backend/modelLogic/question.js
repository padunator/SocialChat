'use strict';
const Question = require('../models/Question');

  var insertQuestions = function(room) {


    var p = Promise.resolve(); // Q() in q

    // Update Question catalog for specific room
    room.connections.forEach(connection => {
      Question.find({room: room.title}).then(questions => {
        questions.forEach(question => {
          if (question.answers.length !== 2) {
            question.answers.push({email: connection.userId, own: "", guess: ""});
            p = p.then(() => question.save());
          }
        });
          return p;
        });
      });
  };

  /*Question.find({}).then( rooms => {
    // For every room,
    // 1. Count the number of connections of the current user(using one or more sockets).
    rooms.map(room => {
      room.connections.forEach(function(connection, i) {
        let pass = true,
          cunt = 0,
          target = 0;
        if (connection.userId === userId) {
          cunt++;
        }
        if (connection.socketId === socket.id) {
          pass = false, target = i;
        }

        // 2. Check if the current room has the disconnected socket,
        // If so, then, remove the current connection object, and terminate the loop.
        if (!pass) {
          room.connections.id(room.connections[target]._id).remove();
          room.save(function(err) {
            callback(err, room, userId, cunt);
          });
        }

        return pass;
      });
    });
  });

*/
module.exports = {

};

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
  insertQuestions,
  getQuestionNumber,
  questionPool
};
