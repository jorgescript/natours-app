const express = require("express");
const { isLoggedIn, protect } = require("../controllers/authController");
const {
  getAccount,
  getOverview,
  getMyTours,
  getTour,
  getLoginForm,
} = require("../controllers/viewController");
const { createBookingCheckout } = require("../controllers/bookingController");

/* ROUTES */
const router = express.Router();

router.get("/", createBookingCheckout, isLoggedIn, getOverview);
router.get("/tour/:slug", isLoggedIn, getTour);
router.get("/login", isLoggedIn, getLoginForm);
router.get("/me", protect, getAccount);
router.get("/my-tours", protect, getMyTours);

module.exports = router;
