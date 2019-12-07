require("dotenv").config();

// PACKAGES
const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  expressSession = require("express-session"),
  cookieParser = require("cookie-parser"),
  engine = require("ejs-mate"),
  methodOverride = require("method-override");

// MODELS
const User = require("./models/user");

// ROUTES
const indexRoutes = require("./routes/index"),
  commentRoutes = require("./routes/comment"),
  campgroundRoutes = require("./routes/campground");

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

// DB CONNECTION
mongoose.connect("mongodb://localhost:27017/YelpCamp_maps", {
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
  res.locals.currentUser = req.user;
  res.locals.error = req.session.error;
  res.locals.success = req.session.success;
  delete req.session.error;
  delete req.session.success;
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
