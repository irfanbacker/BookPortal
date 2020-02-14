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

var users = mongoose.Schema({username: String, password: String});
var availBooks = mongoose.Schema({isbn: Number, seller: String, Name: String,author: String, price: Number});
var soldBooks = mongoose.Schema({isbn: Number, seller: String, buyer: String, Name: String,author: String, price: Number});
var reqBooks = mongoose.Schema({isbn: Number, seller: String, Name: String,author: String, price: Number});

// compile schema to model
var user = mongoose.model('user', users);
var availbook = mongoose.model('availBook', availBooks);
var soldBook = mongoose.model('soldBook', soldBooks);
var reqBook = mongoose.model('reqBook', reqBooks);

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
