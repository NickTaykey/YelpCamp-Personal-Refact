require("dotenv").config();

// PACKAGES
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const engine = require("ejs-mate");
const methodOverride = require("method-override");
const favicon = require("serve-favicon");
const path = require("path");
// require("./seeds")();

// MODELS
const User = require("./models/user");

// ROUTES
const indexRoutes = require("./routes/index");
const commentRoutes = require("./routes/comments");
const campgroundRoutes = require("./routes/campgrounds");

// MIDDLEWARE CONFIG
app.use(bodyParser.urlencoded({ extended: true }));
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(
  expressSession({
    secret: "dhsh12332uewiu4hueh32332uuhrireirewiui746734673",
    resave: false,
    saveUninitialized: false
  })
);
app.use(cookieParser());
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

// DB CONNECTION
mongoose.connect("mongodb://localhost:27017/YelpCamp_user_profile", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("successfully connected to the DB!"));

// PASSPORT CONFIGURATION
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// TEMPLATE CONFIG MIDDLEWARE
app.use((req, res, next) => {
  res.locals.error = req.session.error;
  res.locals.success = req.session.success;
  res.locals.previousLocation = req.headers.referer;
  delete req.session.error;
  delete req.session.success;
  /* mantiene questo utente loggato di default */
  /* req.user = {
    _id: "5e3f0a5c8cf15804da387b30",
    username: "nick3"
  };
  */
  res.locals.currentUser = req.user;
  next();
});

// ROUTES
app.use("/", indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);

// SERVER STARTUP
app.listen(process.env.PORT, process.env.IP, () =>
  console.log("YelpCamp Server has started")
);
