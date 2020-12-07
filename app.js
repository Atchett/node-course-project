const path = require("path");
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();
// const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.hrm10.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

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
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

// connect to db
mongoose
  .connect(MONGODB_OLD_URIFORMAT, MONGODB_CONNECTION_OPTIONS)
  .then((result) => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "John",
          email: "john@test.com",
          cart: { items: [] },
        });
        user.save();
      }
    });
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
