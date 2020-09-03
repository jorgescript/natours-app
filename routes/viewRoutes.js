const express = require("express");
const { isLoggedIn } = require("../controllers/authController");
const {
  getOverview,
  getTour,
  getLoginForm,
} = require("../controllers/viewController");

const router = express.Router();

router.get("/", isLoggedIn, getOverview);
router.get("/tour/:slug", isLoggedIn, getTour);
router.get("/login", isLoggedIn, getLoginForm);

module.exports = router;
