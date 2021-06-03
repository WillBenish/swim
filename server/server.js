var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");

//controllers
var controller = require("./controllers/controller.js");

//Express request pipeline
var app = express();
app.use(express.static(path.join(__dirname, "../app/dist")));
app.use(bodyParser.json())
app.use("/api", controller);

console.log('will test3  ');


module.exports = app;