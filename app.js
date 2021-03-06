//jshint esversion:6
require('dotenv').config();

const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({
  extended:true
}));

app.use(session({
  secret: 'Our little secret.',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");


const userSchema =new mongoose.Schema({
  email:String,
  password:String
})
//this is key to encrypt for decrept information.
userSchema.plugin(passportLocalMongoose);



const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/",function(req,res){
  res.render("home")
})

app.get("/login",function(req,res){
  res.render("login")
})

app.get("/register",function(req,res){
  res.render("register")
})

app.get("/secrets",function(req,res){
  if (req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login")
  }
});

app.get("/logout",function(req,res){
  req.logout()
  res.redirect("/");
});



app.post("/register", function(req,res){
  // register  came from passport-local-mongoose
  // it help to avoid creating our new user, saving our user and interacting with Mongoose "directly".
  User.register({username:req.body.username}, req.body.password, function(err, user ){
    if (err){
      console.log(err);
      res.direct("/register");
    } else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets")
      })
    }
  })
});

app.post("/login",function(req,res){
  const user = new User({
    username:req.body.username,
    password: req.body.password
  });
  // using login() function from passport provides
  //and it has be called on req object
  req.login(user, function(err){
    if(err){
      console.log(err);
    } else{
      // local is strategy from passport?
      passport.authenticate("local")(req, res, function(){
        res.render("secrets");
      })
    }
  })

})



app.listen(3000, function(){
  console.log("server is on running ")
})
