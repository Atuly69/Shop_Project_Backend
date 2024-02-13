const express = require("express");
const {
  login_user,
  register_user
} = require("../controllers/usercontroller");
const router = express.Router();
router.post("/signUp", register_user);
router.post("/login-user", login_user);
module.exports = router;
