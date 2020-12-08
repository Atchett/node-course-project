const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");

const User = require("../models/user");
sgMail.setApiKey(process.env.SENDGRID_KEY);

// Login
exports.getLogin = (req, res, next) => {
  const message = req.flash("error");
  let outputMsg = null;
  if (message?.length) {
    outputMsg = message[0];
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: outputMsg,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email / password");
        return res.redirect("/login");
      }
      return bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }
          req.flash("error", "Invalid email or password.");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

// Signup
exports.getSignup = (req, res, next) => {
  const message = req.flash("error");
  let outputMsg = null;
  if (message?.length) {
    outputMsg = message[0];
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
    errorMessage: outputMsg,
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "Email exists. Ty another.");
        return res.redirect("/signup");
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then((result) => {
          res.redirect("/login");
          const msg = {
            to: email,
            from: "johnspurgin@gmail.com",
            subject: "Signup succeeded",
            html: "<h1>Successfully signed up</h1>",
          };
          return sgMail.send(msg);
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

// Logout
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
