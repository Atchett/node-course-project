const mongodb = require("mongodb");
const { getDb } = require("../util/database");
const ObjectId = mongodb.ObjectId;

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new ObjectId(id) : null;
    this.userId = userId;
  }

  save() {
    const db = getDb();

    if (this._id) {
      return db
        .collection("products")
        .updateOne({ _id: this._id }, { $set: this })
        .then((result) => {
          //console.log(result);
        })
        .catch((err) => {
          console.log(err);
        });
    }

    return db
      .collection("products")
      .insertOne(this)
      .then((result) => {
        // console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        return products;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static findById(prodId) {
    const db = getDb();
    return db
      .collection("products")
      .find({ _id: new ObjectId(prodId) })
      .next()
      .then((product) => {
        //console.log(product);
        return product;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static deleteById(prodId) {
    const db = getDb();
    return db
      .collection("products")
      .deleteOne({ _id: new ObjectId(prodId) })
      .then((result) => {
        // console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = Product;
