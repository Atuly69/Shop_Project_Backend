const express = require("express");
const {
  add_product,
  get_all_products,
  edit_product,
  delete_product,
  place_order,
  get_user_order,
  add_cart,
  upd_cart,
  get_user_cart
} = require("../controllers/shopcontroller");
const router = express.Router();
const jwt = require('jsonwebtoken');
const { secretKey } = require("../secret_key");

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  console.log({token});

  if (!token) {
    return res.status(401).json({ message: 'Token is not provided', staus: 0 });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }
    else {
      req.user = decoded;
      next();
    }
  });
};



router.post("/add-product", add_product);
router.post("/edit-product", edit_product);
router.post("/get-all-product", get_all_products);
router.post("/delete-product", delete_product);
router.post("/place-order", verifyToken, place_order);
router.post("/get-user-order", verifyToken, get_user_order);
router.post("/add-cart", verifyToken, add_cart);
router.post("/upd-cart", verifyToken, upd_cart);
router.post("/get-user-cart", verifyToken, get_user_cart);

module.exports = router;
