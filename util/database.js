const { MongoClient } = require("mongodb");

let _db;

const mongoConnect = (callback, options) => {
  MongoClient.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.hrm10.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    options
  )
    .then((client) => {
      console.log("Connected to MongoDB!");
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
