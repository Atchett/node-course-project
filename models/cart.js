const fs = require("fs");
const path = require("path");
const pathHelper = require("../util/path");
const p = path.join(pathHelper, "data", "cart.json");

module.exports = class Cart {
  static addProduct(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      // get the index of the existing product
      const existingProductIndex = cart.products.findIndex(
        (prod) => prod.id === id
      );
      // get the existing product
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      if (existingProduct) {
        // product exists
        updatedProduct = { ...existingProduct };
        // update the quantity
        updatedProduct.qty = updatedProduct.qty + 1;
        // copy the old array
        cart.products = [...cart.products];
        // overwrite the existing product with the updated one
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id: id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice = cart.totalPrice + +productPrice;
      fs.writeFile(p, JSON.stringify(cart), (err) => {
        console.log(err);
      });
    });
  }

  static deleteProduct(id, price) {
    fs.readFile(p, (err, fileContent) => {
      if (err) return;
      const updatedCart = { ...JSON.parse(fileContent) };
      const product = updatedCart.products.find((p) => p.id === id);
      if (!product) return;
      const productQty = product.qty;
      updatedCart.products = updatedCart.products.filter((p) => p.id !== id);
      const updatedTotalPrice = updatedCart.totalPrice - +price * +productQty;
      updatedCart.totalPrice = +updatedTotalPrice.toFixed(2);
      fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
        console.log(err);
      });
    });
  }

  static getCart(cb) {
    fs.readFile(p, (err, fileContent) => {
      const cart = JSON.parse(fileContent);
      if (err) cb(null);
      cb(cart);
    });
  }
};
