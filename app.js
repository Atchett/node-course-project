const path = require("path");
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");

const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();
// const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.hrm10.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
const csrfProtection = csrf();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, `${new Date().toISOString()}-${file.originalname}`);
  },
});
const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
const fileFilter = (req, file, cb) => {
  const allowedFile = allowedMimeTypes.includes(file.mimetype);
  cb(null, allowedFile);
};

const MONGODB_OLD_URIFORMAT = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-shard-00-00.hrm10.mongodb.net:27017,cluster0-shard-00-01.hrm10.mongodb.net:27017,cluster0-shard-00-02.hrm10.mongodb.net:27017/${process.env.MONGO_DB}?ssl=true&replicaSet=atlas-9469ec-shard-0&authSource=admin&retryWrites=true&w=majority`;

const MONGODB_CONNECTION_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const store = new MongoDBStore({
  uri: MONGODB_OLD_URIFORMAT,
  connectionOptions: MONGODB_CONNECTION_OPTIONS,
  collection: "sessions",
});
store.on("error", (error) => {
  console.log(error);
});

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);
app.get("/500", errorController.get500);

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render("500", {
    pageTitle: "Server Error",
    path: "/500",
  });
  //res.redirect("/500");
});

// connect to db
mongoose
  .connect(MONGODB_OLD_URIFORMAT, MONGODB_CONNECTION_OPTIONS)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    const error = new Error(`db Connection failed. Error: ${err}`);
    error.httpStatusCode = 500;
    return next(error);
  });
