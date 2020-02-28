const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require ('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');
const roomLogic = require('../modelLogic/room');
const router = express.Router();
/**
 * Middleware for the authentication route which handle authentication and user related REST Api calls
 */

// Register a new user
router.post("/signup", (req, res, next) => {
    bcrypt.hash(req.body.password, 10).then(hash => {
      const user = new User({
        email: req.body.email,
        username: req.body.username,
        password: hash,
        status: false
      });
      user.save().then(result => {
        res.status(201).json({
          message: 'New user created!',
          result: result
        });
      })
        .catch(error => {
          res.status(500).json({
            error: error
          });
        });
    });
  });

// Check authentication data and create token for the acgtive session
router.post("/login", (req, res, next) => {
  let fetchedUser;

  User.findOne({email: req.body.email})
  .then(user => {
    if (!user) {
      res.status(401).json({
        message: 'User not found!'
      });
    }
    fetchedUser = user;
    // This returns a promise - therefor another then() is chained
    return bcrypt.compare(req.body.password, user.password);
  })
  .then(compResult => {
    if (!compResult) {
      return res.status(401).json({
        message: 'Password incorrect!'
      });
    }
    // Create new token based on individual input data
    const token = jwt.sign({email: fetchedUser.email , uid: fetchedUser._id},
      'secret_passphrase_for_encryption', {expiresIn: '1h'});
    // Return JSON Web Token
     return res.status(200).json({
       token: token,
       expiresIn: 3600
     });
  })
  .catch(err => {
    return res.status(401).json({
      message: 'Authorisation failed!'
    });
  });
});

// Change online/ offline status for the user
router.put("/changeStatus/:email", (req, res, next) => {
  User.updateOne({email: req.params.email}, {status: req.body.status})
    .then(result => {
      res.status(200).json({email: req.params.email});
    });
});

// Get specific user
router.get("/getUser/:email",  (req, res, next) => {
  User.findOne({email: req.params.email}).
  then(foundUser => {
    return res.status(200).json({
      user: foundUser
    });
  })
    .catch( err => {
      return res.status(401).json({
        message: 'User not found!'
      });
    });
});

// Get list of users
router.get("/getUsers",  (req, res, next) => {
  User.find().then(foundUsers => {
    return res.status(200).json({
      user: foundUsers
    });
  });
});

// Get users in specific room
router.get("/getUsersInRoom/:room",  (req, res, next) => {
  Room.findOne({title: req.params.room}).then(room => {
    roomLogic.getUsers(room, function (err, users, cuntUserInRoom) {
      if (err) {
        return res.status(500).json({
        error: 'No users connected to room!'
        })
      } else {
        return res.status(200).json({
          user: users
        })
      }
    });
  });
});

module.exports = router;
