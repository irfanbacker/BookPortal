const express = require('express');
const socket=require("socket.io");
const passport = require('passport');
var Strategy = require('passport-local').Strategy;

//-------------------------------------------------MongoDB----------------------------------------------------------------------

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/bookportal',{ useNewUrlParser: true , useUnifiedTopology: true});

var db = mongoose.connection;

db.on('error',function(){
   console.log('\nMongoDB Connection Error. Please make sure that MongoDB is running\n');
   process.exit();
});

var users = mongoose.Schema({username: String,password: String});
var usersinfo = mongoose.Schema({username: String, firstName: String, lastName: String, email: String, phone: Number});

var availBooks = mongoose.Schema({isbn: Number, addDate:Date, seller: String, title: String,author: String, price: Number, genre: String});
var soldBooks = mongoose.Schema({isbn: Number, sellDate:Date, seller: String, buyer: String, title: String,author: String, price: Number});
var reqBooks = mongoose.Schema({isbn: Number, reqDate:Date, seller: String, title: String,author: String, price: Number});

// compile schema to model
var user = mongoose.model('user', users);
var userinfo = mongoose.model('userinfo', usersinfo);
var availbook = mongoose.model('availBook', availBooks);
var reqBook = mongoose.model('reqBook', reqBooks);
var soldBook = mongoose.model('soldBook', soldBooks);

db.once('open', function() {
    console.log("Database connection Successful!");
});

function newUser(nuser){
  var user1 = new user({ username: nuser.username, password: nuser.password});
  var info1 = new userinfo({ username: nuser.username, firstName: nuser.firstName, lastName: nuser.lastName, email: nuser.email,phone: nuser.phone});
  // save model to database
  user1.save(function (err, user) {
    if (err) return console.error(err);
    console.log(nuser.username + " has registered");
  });
  info1.save(function (err, userinfo) {
    if (err) return console.error(err);
  });
};

function getHistory(uname) {
  return [];
}

function addBook(data) {
  //---ADD_BOOK
}

function getBook(data) {
  //---GET_BOOK
  return {status:1, title: 'THomas Calculus', author: 'Thomas', genre: 'Math', isbn: 1234567890, price: 123};
}

function buyBook(data) {
  //---BUY_BOOK
}

//-------------------------------------------------PASSPORT----------------------------------------------------------------------

passport.use(new Strategy(
  function(username, password, cb) {
      console.log('checking '+username);
      user.findOne({username: username}, function (err, luser) {
        if (err) return console.error(err);
        if(luser){
          if(luser.password==password) return cb(null, {username: username});
        }
        return cb(null, false);
      });
      //if (username!='test') { return cb(null, false); }
      //if (password != 'test') { return cb(null, false); }
      //return cb(null, {username: username});
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(user, cb) {
    cb(null, user);
});

function isLoggedIn(req ,res, next){
  if(req.isAuthenticated()){
    return next();
  }else{
    return res.redirect('/login');
  }
};

//-------------------------------------------------EXPRESS----------------------------------------------------------------------

const app = express();
//const { check, validationResult } = require('express-validator');

//app.use(express.json());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(express.static('public'));

app.use(passport.initialize());
app.use(passport.session());

//-------------------------------------------------ROUTES----------------------------------------------------------------------

app.get('/',function(req, res) {
  if(!req.user) res.sendFile(__dirname + "/views/login.html");
  else res.redirect('/dashboard');
  });

app.get('/login',function(req, res){
    res.sendFile(__dirname + "/views/login.html");
  });

  app.get('/loginfail',function(req, res){
      res.sendFile(__dirname + "/views/loginfail.html");
    });

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) {
      console.log('auth fail '+user);
      return res.redirect('/loginfail');
    }
    else req.logIn(user, function(err) {
      if (err) { return next(err); }
      console.log(user);
      return res.redirect('/dashboard');
    });
  })(req, res, next);
});

app.get('/logout',function(req, res){
    req.logout();
    res.redirect('/');
});

app.get("/signup", function(req, res) {
    res.sendFile(__dirname + "/views/signup.html");
});

app.get('/dashboard',isLoggedIn,function(req, res){
    res.sendFile(__dirname + "/views/dashboard.html");
});

app.get('/addbook',isLoggedIn,function(req, res){
    res.sendFile(__dirname + "/views/addbook.html");
});

app.get('/buybook',isLoggedIn,function(req, res){
    res.sendFile(__dirname + "/views/buybook.html");
});

app.get('/denied', function(req, res) {
    res.sendFile(__dirname + "/views/denied.html");
});

//----------------------------------------------------------

app.get('/api/user',isLoggedIn, function(req, res) {
    var hlist = getHistory(req.user);
    res.send({user: req.user, history: hlist});
});

app.post('/api/newbook',isLoggedIn, function(req, res) {
    addBook(req.body);
    res.send({status: 1});
});

app.post('/api/getbook',isLoggedIn, function(req, res) {
    res.send(getBook(req.body));
});

app.post('/api/buybook',isLoggedIn, function(req, res) {
    buyBook(req.body);
    res.send({status: 1});
});

app.use(function (req, res, next) {
  res.status(404).sendFile(__dirname + "/views/404.html");
});

//---------------------------------------------------------------------------------------------------------------------

const listener=app.listen(3000,function() {
  console.log("Your app is listening on port " + 3000);
});

const io = socket(listener);

//----------------------------SOCKET-----------------------------------------------------------------------------------------

io.on("connection", function(socket) {

  socket.on('checkinput', function(data){
    var userexists=0;
    var q=user.findOne({username: data.username},function (err,euser) {
      if(euser){
        console.log(data.username+' repeated');
        userexists=1;
      }
      socket.emit("inputresponse", userexists);
    });
  });

  socket.on('newuser', function (user) {
      newUser(user);
  });

  socket.on('disconnect', function () {
      socket.emit('disconnected');
  });

});
