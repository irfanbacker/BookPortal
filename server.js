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

var availBooks = mongoose.Schema({isbn: Number, addDate:Date, owner: String, title: String, author: String, price: Number, genre: String});
var soldBooks = mongoose.Schema({isbn: Number, addDate:Date, sellDate:Date, owner: String, buyer: String, title: String,author: String, price: Number, genre: String});
var reqBooks = mongoose.Schema({isbn: Number, reqDate:Date, uname: String, title: String, author: String});

// compile schema to model
var user = mongoose.model('user', users);
var userinfo = mongoose.model('userinfo', usersinfo);
var availBook = mongoose.model('availBook', availBooks);
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

function getHistory(uname, cb) {
  availBook.find({owner: uname.username}, function (err, books1) {
    if (err) return console.error(err);
    else {
      soldBook.find({$or:[ {'owner':uname.username}, {'buyer':uname.username}]}, function (err, books2) {
        if (err) return console.error(err);
        else {
          reqBook.find({uname: uname.username}, function (err, books3) {
            if (err) return console.error(err);
            else {
              cb(books1,books2,books3);
            }
          });
        }
      });
    }
  });
}

function getProfile(uname,cb){
  userinfo.findOne({username: uname.username}, function (err, user) {
    getHistory(uname,function (avlist,slist,reqlist){
      cb(user,{avbooks: avlist.length, sbooks: slist.length, reqbooks: reqlist.length});
    });
  });
}

function searchBook(val,par,cb) {
  var searchKey = new RegExp(val, 'i');
  var sdata={};
  sdata[par] = searchKey;
  availBook.find(sdata, function (err, books) {
    if (err) return console.error(err);
    else {
      cb(books);
    }
  });
}

function addBook(cuser,data) {
  var book1 = new availBook({isbn: data.isbn, addDate: Date(), owner: cuser.username, title: data.title, author: data.author, price: data.price, genre: data.genre});
  book1.save(function (err, book) {
    if (err) return console.error(err);
    else console.log(data.title + " is added by "+cuser.username);
  });
}

function reqBookfn(cuser,data,cb) {
  var book1 = new reqBook({isbn: data.isbn, reqDate: Date(), uname: cuser.username, title: data.title, author: data.author});
  reqBook.findOne({isbn: data.isbn, uname: cuser.username}, function (err, book) {
    if (err) return console.error(err);
    else {
      if(book == null){
        book1.save(function (err, book) {
          if (err) return console.error(err);
          else {
            console.log(data.title + " is requested by "+cuser.username);
            cb(0);
          }
        });
      }
      else cb(1);
    }
  });
}

function getBook(data,cb) {
  availBook.findOne({isbn: data.isbn}, function (err, book) {
    if (err) return console.error(err);
    else {
      if(book == null) cb({status: 0});
      else {
        cb({status: 1, title: book.title, author: book.author, genre: book.genre, isbn: book.isbn, owner: book.owner, price: book.price});
      }
    }
  });
}

function buyBook(cuser,data) {
  var book1=new soldBook();
  availBook.findOne({isbn: data.isbn}, function (err, book) {
    if (err) return console.error(err);
    else {
      book1.isbn = book.isbn;
      book1.title = book.title;
      book1.author = book.author;
      book1.genre = book.genre;
      book1.price = book.price;
      book1.owner = book.owner;
      book1.buyer = cuser.username;
      book1.sellDate = Date();
      book1.addDate = book.addDate;
    }
  }).then(function (){
    //console.log(book1);
    availBook.deleteOne({isbn: data.isbn}, function (err) {
      if (err) return console.error(err);
    });
    book1.save(function (err, book) {
      if (err) return console.error(err);
      console.log(book1.title + " is bought by "+book1.buyer);
    });
  });avail
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

//------------------------------------------------------------------------------------------------------------------------------

function getFields(input, field) {
    var output = [];
    for (var i=0; i < input.length ; ++i)
        output.push(input[i][field]);
    return output;
}

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

app.get('/reqbook',isLoggedIn,function(req, res){
    res.sendFile(__dirname + "/views/reqbook.html");
});

app.get('/buybook',isLoggedIn,function(req, res){
    res.sendFile(__dirname + "/views/buybook.html");
});

app.get('/search',isLoggedIn,function(req, res){
    res.sendFile(__dirname + "/views/search.html");
});

app.get('/myprofile',isLoggedIn,function(req, res){
    res.sendFile(__dirname + "/views/profile.html");
});

app.get('/profile/:id',isLoggedIn,function(req, res){
    res.sendFile(__dirname + "/views/userprofile.html");
});

app.get('/denied', function(req, res) {
    res.sendFile(__dirname + "/views/denied.html");
});
//----------------------------------------------------------------------------------------------

app.get('/api/user',isLoggedIn, function(req, res) {
    getHistory(req.user, function (avlist,slist,reqlist) {
      if((avlist.length+slist.length+reqlist.length)==0) res.send({user: req.user, empty:1});
      else res.send({user: req.user, avlist: avlist, slist: slist, reqlist:reqlist, empty:0});
    });
});

app.get('/api/user/profile',isLoggedIn, function(req, res) {
    getProfile(req.user, function (udata,bdata) {
      res.send({user: udata, info: bdata});
    });
});

app.get('/api/reqavail',isLoggedIn, function(req, res) {
    reqBook.find({uname: req.user.username}, function (err, reqbooks) {
      if (err) return console.error(err);
      else {
        if(reqbooks.length==0) res.send({empty:1});
        else{
          availBook.find({'isbn': { $in: getFields(reqbooks,'isbn') }}, function (err, books) {
            if (err) return console.error(err);
            else {
              if(books.length==0) res.send({empty:1});
              else res.send({empty:0, reqavail:books});
            }
          });
        }
      }
    });
});

app.post('/api/profile',isLoggedIn, function(req, res) {
    getProfile({username: req.body.uname}, function (udata,bdata) {
      if(req.user.username == req.body.uname) res.send({user: udata, info: bdata, same: true});
      else res.send({user: udata, info: bdata, same: false});
    });
});

app.post('/api/newbook',isLoggedIn, function(req, res) {
    addBook(req.user,req.body);
    res.send({status: 1});
});

app.post('/api/reqbook',isLoggedIn, function(req, res) {
    availBook.findOne({isbn: req.body.isbn}, function (err, book) {
      if (err) return console.error(err);
      else {
        if(book != null) res.send({status: 0});
        else {
          reqBookfn(req.user,req.body,function (reqexists){
            res.send({status: 1, exists: reqexists});
          });
        }
      }
    });
});

app.post('/api/remreqs',isLoggedIn, function(req, res) {
    console.log(req.body.slist);
    reqBook.deleteMany({'isbn': { $in: req.body.slist }}, function (err) {
      if(err) console.log(err);
      else {
        console.log("Successful deletion");
        res.send({status: 1});
      }
    });
});

app.post('/api/getbook',isLoggedIn, function(req, res) {
    getBook(req.body,function(data) {
      if(data.owner == req.user.username) res.send({data:data, same: true});
      else res.send({data:data, same: false});
    });
});

app.post('/api/buybook',isLoggedIn, function(req, res) {
    buyBook(req.user,req.body);
    res.send({status: 1});
});

app.post('/api/search',isLoggedIn, function(req, res) {
    searchBook(req.body.val, req.body.par,function (data){
      res.send({user: req.user, results: data});
    });
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
