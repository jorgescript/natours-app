const express = require("express");
const { isLoggedIn, protect } = require("../controllers/authController");
const {
  getAccount,
  getOverview,
  getTour,
  getLoginForm,
} = require("../controllers/viewController");

const router = express.Router();

router.get("/", isLoggedIn, getOverview);
router.get("/tour/:slug", isLoggedIn, getTour);
router.get("/login", isLoggedIn, getLoginForm);
router.get("/me", protect, getAccount);

module.exports = router;