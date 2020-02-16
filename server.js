var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;

//-------------------------------------------------PASSPORT----------------------------------------------------------------------

passport.use(new Strategy(
  function(username, password, cb) {
      console.log('checking '+username);
      if (username!='test') { return cb(null, false); }
      if (password != 'test') { return cb(null, false); }
      return cb(null, {username: username});
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

var app = express();

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

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) {
      console.log('auth fail '+user);
      return res.redirect('/login');
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
    console.log(req.user);
    res.sendFile(__dirname + "/views/dashboard.html");
});

app.get('/denied', function(req, res) {
    res.sendFile(__dirname + "/views/denied.html");
});

app.use(function (req, res, next) {
  res.status(404).sendFile(__dirname + "/views/404.html");
});

//---------------------------------------------------------------------------------------------------------------------

app.listen(3000,function() {
  console.log("Your app is listening on port " + 3000);
});
