const express  = require("express");
const app = express();

var socket=require("socket.io");

var port=3000;

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

app.use(express.static('public'));

//--------------------------------------------------------------------------------------------------------------

mongoose.connect('mongodb://localhost:27017/bookportal',{ useNewUrlParser: true , useUnifiedTopology: true});

var db = mongoose.connection;

db.on('error',function(){
   console.log('\nMongoDB Connection Error. Please make sure that MongoDB is running\n');
   process.exit();
});

var users = mongoose.Schema({username: String, type: String, token: String});
var organisers = mongoose.Schema({username: String, Name: String, positon: String});
var events = mongoose.Schema({eventcode: String, Name: String});
var sponsors = mongoose.Schema({username: String, Name: String, eventcode: String});
var participants = mongoose.Schema({username: String, Name: String, eventcode: String});

// compile schema to model
var user = mongoose.model('user', users);
var organiser = mongoose.model('organiser', organisers);
var fevent = mongoose.model('fevent', events);
var sponsor = mongoose.model('sponsor', sponsors);
var participant = mongoose.model('participant', participants);

db.once('open', function() {
    console.log("Database connection Successful!");
});
//--------------------------------------------------------------------------------------------------------------

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

//-------------------------------------------------------------------------------

const listener = app.listen(port,function() {
  console.log("Your app is listening on port " + port);
});

const io = socket(listener);
