const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require ('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post("/signup", (req, res, next) => {
    console.log('Inside de signup method - server side');
    bcrypt.hash(req.body.password, 10).then(hash => {
      const user = new User({
        email: req.body.email,
        username: req.body.username,
        password: hash,
        status: false
      });
      console.log(user);
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

router.put("/changeStatus/:email", (req, res, next) => {
  User.updateOne({email: req.params.email}, {status: req.body.status})
    .then(result => {
      res.status(200).json({message: "Update successful!"});
    });
});

router.get("/getUser/:email",  (req, res, next) => {
  console.log('In Server get Method for email ' + req.params.email);
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

router.get("/getUsers",  (req, res, next) => {
  User.find().then(foundUsers => {
    return res.status(200).json({
      user: foundUsers
    });
  });
});

module.exports = router;
