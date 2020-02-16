const express  = require("express");
const app = express();

var socket=require("socket.io");

var port=3000;

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var passport = require('passport');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use(require('express-session')({ secret: 'secretkey', resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

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

app.get("/", function(req, res) {
  if(req.username) res.redirect('/dashboard');
  else res.sendFile(__dirname + "/views/index.html");
});

app.get('/login', (req, res) => {
  if(req.username) res.redirect('/dashboard');
  else res.sendFile(__dirname + "/views/login.html");
});

app.get("/signup", function(req, res) {
  res.sendFile(__dirname + "/views/signup.html");
});

app.get('/dashboard', isLoggedIn, (req, res) => {
        res.sendFile(__dirname + "/views/dashboard.html");
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/404' }),
  function(req, res) {
    res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/login');
});

app.get('/denied', (req, res) => {
        res.sendFile(__dirname + "/views/denied.html");
});

app.use(function (req, res, next) {
  res.status(404).sendFile(__dirname + "/views/404.html");
});
//-------------------------------------------------------------------------------

const listener = app.listen(port,function() {
  console.log("Your app is listening on port " + port);
});

const io = socket(listener);

//--------------------------------------------------------------------------------------------------------------
const LocalStrategy = require('passport-local').Strategy;

/*passport.use(new LocalStrategy(
  function(username, password, done) {
        console.log('checking '+username);
        if(username === 'test' && password === 'test') {
           return done(null, {username: username});
        } else {
           return done(null, false);
        }
        UserDetails.findOne({username: username}, function(err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false);
          }
          if (user.password != password) {
            return done(null, false);
          }
          return done(null, {username: username});
        });
    }
 ));*/

 passport.use(new LocalStrategy(
   function(username, password, cb) {
      console.log('checking '+username);
      if (username!='test') { return cb(null, false); }
      if (password != 'test') { return cb(null, false); }
      return cb(null, {username: username});
   }));

  passport.serializeUser(function(user, cb) {
    cb(null, user.username);
  });

  passport.deserializeUser(function(username, cb) {
    cb(null, {username: username});
  });

function isLoggedIn(req ,res, next){
  if(req.isAuthenticated()){
    return next();
  }else{
    return res.redirect('/denied');
  }
};
