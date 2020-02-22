// PACKAGES
const passport = require("passport");
const util = require("util");
const { cloudinary } = require("../cloudinary");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// MODELS
const User = require("../models/user");
const Comment = require("../models/comment");
const Campground = require("../models/campground");
// MIDLEWARES
const { deleteImage } = require("../middleware/modelsMiddleware");

module.exports = {
  landing: async (req, res, next) => {
    let campgrounds = await Campground.find();
    res.render("landing", { campgrounds });
  },
  registerGet: (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect("/campgrounds");
    }
    res.render("register", { username: "", email: "" });
  },
  registerPost: async (req, res, next) => {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email
    });
    if (req.file) {
      newUser.image = {
        secure_url: req.file.secure_url,
        public_id: req.file.public_id
      };
    }
    try {
      let user = await User.register(newUser, req.body.password);
      passport.authenticate("local")(req, res, () => {
        req.session.success = `Wellcome on YelpCamp ${user.username}!`;
        const url = req.session.url ? req.session.url : "/campgrounds";
        delete req.session.url;
        res.redirect(url);
      });
    } catch (err) {
      await deleteImage(req);
      let error = err.message;
      if (
        error.includes("E11000 duplicate key error collection") &&
        error.includes("email_1 dup key:")
      ) {
        error = "Another user is registered with this email";
      }
      res.render("register", {
        error,
        username: req.body.username,
        email: req.body.email
      });
    }
  },
  loginGet: (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect("/campgrounds");
    }
    res.render("login", { username: "" });
  },
  loginPost: async (req, res, next) => {
    const { username, password } = req.body;
    const { err, user } = await User.authenticate()(username, password);
    if (!err && user) {
      req.login(user, function() {
        req.session.success = `Welcome back ${username}!`;
        const url = req.session.url ? req.session.url : "/campgrounds";
        delete req.session.url;
        res.redirect(url);
      });
    } else if (!user) {
      const error = "Invalid username or password!";
      res.render("login", { error, username });
    } else next(err);
  },
  logout: (req, res, next) => {
    req.logout();
    req.session.success = "You are logged out!";
    res.redirect("/campgrounds");
  },
  profileGet: async (req, res, next) => {
    const user = res.locals.user;
    let campgrounds = await Campground.find({}, null, { sort: { _id: -1 } })
      .where("author")
      .equals(user._id)
      .populate("comments")
      .exec();
    let comments = await Comment.find({}, null, { sort: { _id: -1 } })
      .where("author")
      .equals(user._id)
      .exec();
    const avgRatings = [];
    for (let c of campgrounds) {
      avgRatings.push(await c.calcAvgRating());
    }
    res.render("profile", { campgrounds, comments, avgRatings });
  },
  profileEdit(req, res, next) {
    res.render("editProfile");
  },
  async profileUpdate(req, res, next) {
    const { user } = res.locals;
    const { username, email, removeImage } = req.body;
    try {
      if (username && username.length) user.username = username;
      if (email && email.length) user.email = email;
      await user.save();
    } catch (e) {
      await deleteImage(req);
      let msg;
      if (
        e.message.includes(
          "E11000 duplicate key error collection: YelpCamp_user_profile.users index: email_1 dup key:"
        )
      ) {
        msg = "E-mail alerady in use";
      } else {
        msg = "Username alerady in use";
      }
      req.session.error = msg;
      return res.redirect(`/users/${req.user.username}/edit`);
    }
    if (req.file) {
      // eliminiamo l'immagine attuale
      if (user.image.public_id)
        await cloudinary.v2.uploader.destroy(user.image.public_id);
      // settiamo nel DB quella nuova
      user.image = {
        secure_url: req.file.secure_url,
        public_id: req.file.public_id
      };
    } else if (removeImage) {
      user.image = { secure_url: "/images/user-ico.jpeg" };
    }
    await user.save();
    // ri autentichiamo l'utente (nel caso dello username aggiornato la sessione attuale nn è più valida)
    const login = util.promisify(req.login.bind(req));
    await login(user);
    req.session.success = "profile successfully updated!";
    res.redirect(`/users/${user.username}/edit`);
  },
  // render forgot.ejs form
  forgotGet(req, res, next) {
    res.render("users/forgot");
  },
  // PUT process data from the former form, send an email with a token
  async forgotPut(req, res, next) {
    const { email } = req.body;
    // check if the user exists
    const user = await User.findOne({ email });
    // if it does not exist raise an err
    if (!user) {
      req.session.error = `There are no users registered with "${email}"`;
      return res.redirect("/forgot-password");
    }
    // if yes gen and set token
    user.passwordResetToken = crypto.randomBytes(20).toString("hex");
    user.passwordResetExpires = Date.now() + 3600000;
    await user.save();
    // send email with the token
    const msg = {
      from: "The YelpCamp Team <yelpcamp@yelpcamp.com>",
      to: email,
      subject: "Password Reset request",
      html: `
      <h2>Hi, ${user.username}!</h2>
      <p>
      You or somebody else has requested a password reset for your account.
      <br>
      if you did that 
      <a href="http://${req.headers.host}/reset-password/${user.passwordResetToken}" target="_blank" rel="noopener noreferrer">
          this is the link to fullfill the process
      </a>
      <br>
      if you did not request this <strong>Do not open the link</strong> just ignore this mail.
      <br>
      Cheers!
      <br>
      <br>
      <em>The Yelpcamp development team</em>
      </p>
      `.replace(/      /g, "")
    };
    await sgMail.send(msg);
    req.session.success =
      "An email has been sent to you with further instructions";
    res.redirect("/forgot-password");
  },
  // GET validate token to render reset form
  async resetGet(req, res, next) {
    const { token } = req.params;
    res.render("users/reset", { token });
  },
  // PUT process reset form data and change the password
  async resetPut(req, res, next) {
    const { user } = res.locals;
    const { newPassword, confirmPassword } = req.body;
    if (newPassword.length && confirmPassword)
      if (newPassword === confirmPassword) {
        // check if the passwords match
        // reset the password
        await user.setPassword(newPassword);
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();
        // log the user in back
        const login = util.promisify(req.login.bind(req));
        await login(user);
        // send a success password reset mail
        const msg = {
          from: "The YelpCamp Team <yelpcamp@yelpcamp.com>",
          to: user.email,
          subject: "Successfully reseted password!",
          html: `<h2>Hi, ${user.username}</h2>
        <p>
        <strong>The password of your account has been successfully reseted!</strong>
        <br>
        <strong>If you do not know what this email is about</strong> reply us at once.
        <br>
        Cheers!
        <br>
        <br>
        <em>The Yelpcamp development team</em>
        </p>`.replace(/        /g, "")
        };
        await sgMail.send(msg);
        req.session.success = "Your password has been successfully reseted";
        res.redirect("/campgrounds");
      } else {
        // passwords matching error
        req.session.error = "Passwords do not match";
        return res.redirect(`/reset-password/${user.passwordResetToken}`);
      }
    else {
      // missing passwords error
      req.session.error = "missing passwords";
      return res.redirect(`/reset-password/${user.passwordResetToken}`);
    }
  }
};
