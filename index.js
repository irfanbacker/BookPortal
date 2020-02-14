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

var users = mongoose.Schema({
                              username: { type: String,
                                          required: true,
                                          minlength: 3,
                                          maxlength: 50 },
                              password: { type: String,
                                          required: true,
                                          minlength: 7,
                                          maxlength: 255 }
                            });

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

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
     (username, password, done) => {


        if(username === 'test@gmail.com' && password === '1234') {
           return done(null, {username: 'test@gmail.com'});
        } else {
           return done(null, false);
        }
    }
 ));

function isLoggedIn(req ,res, next){
  if(req.isAuthenticated()){
    return next();
  }else{
    return res.redirect('/login');
}

//--------------------------------------------------------------------------------------------------------------

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get('/login', (req, res) => {
        res.sendFile(__dirname + "/views/login.html");
});

app.get('/dashboard', isLoggedIn, (req, res) => {
        res.sendFile(__dirname + "/views/dashboard.html");
});

app.post('/login', passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/dashboard'
}));

app.use(function (req, res, next) {
  res.status(404).sendFile(__dirname + "/views/404.html");
});
//-------------------------------------------------------------------------------

const listener = app.listen(port,function() {
  console.log("Your app is listening on port " + port);
});

const io = socket(listener);
