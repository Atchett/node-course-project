const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

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
    oldInput: { email: "", password: "" },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessage: "Invalid email / password",
          oldInput: { email, password },
          validationErrors: [],
        });
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
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "Invalid email / password",
            oldInput: { email, password },
            validationErrors: [],
          });
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
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password, confirmPassword },
      validationErrors: errors.array(),
    });
  }

  bcrypt
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
};

// Logout
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  const message = req.flash("error");
  let outputMsg = null;
  if (message?.length) {
    outputMsg = message[0];
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: outputMsg,
  });
};

exports.postReset = (req, res, next) => {
  const { email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/reset", {
      path: "/reset",
      pageTitle: "Reset Password",
      errorMessage: errors.array()[0].msg,
    });
  }

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash("error", "Could not find that account");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        const msg = {
          to: email,
          from: "johnspurgin@gmail.com",
          subject: "Password reset",
          html: `
          <p>You requested a password reset</p>
          <p><a href="http://localhost:3000/reset/${token}">Set new password</a></p>
          `,
        };
        return sgMail.send(msg);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const { resetToken } = req.params;
  User.findOne({
    resetToken: resetToken,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      const message = req.flash("error");
      let outputMsg = null;
      if (message?.length) {
        outputMsg = message[0];
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New password",
        errorMessage: outputMsg,
        userId: user._id.toString(),
        resetToken: resetToken,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const { userId, password, resetToken } = req.body;
  User.findOne({
    resetToken: resetToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      return bcrypt.hash(password, 12).then((hashedPassword) => {
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        return user.save();
      });
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
    });
};
