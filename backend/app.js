'use strict';

/**
 * This is the actual express app which is returned to the server connection as a big chain of middlewares for the individual
 * Rest API calls. We are using routing to route the individual api calls to the related middlewares of chat, game or auth
 * for better overview / structuring
 * @type {e | (() => Express)}
 */

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const app = express(); //returns an express app! IS a big chain of middlewares to apply

const chatRoutes = require('./routes/messages');
const userRoutes = require('./routes/user');
const gameRoutes = require( './routes/game');


//Establish database connection with the MongoDB Cloud
mongoose.connect(
  // "mongodb+srv://stefanpadi:z1n%3B%21F1GkTZq@clearn-zrafl.mongodb.net/clearn-chatapp", Project0
  // "mongodb+srv://stefanpadi:2809777paduretu@cluster0-exwix.mongodb.net/clearn-chatapp", // Game3_BAKK
  "mongodb+srv://stefanpadi:z1n%3B%21F1GkTZq@cluster0-thibu.mongodb.net/clearn-chatapp", // SWA
  {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => {
    console.log("Database connected!");
  })
  .catch(() => {
    console.log("Connection failed!");
  });



//Defining Routes
//Body parser config
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//General settings
app.use((req,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  next();
});


//Routing for Chat related API
app.use("/api/chat", chatRoutes);
//Routing for User related API
app.use("/api/user", userRoutes);
// Routing for Game related API
app.use("/api/game", gameRoutes);

module.exports = app;
