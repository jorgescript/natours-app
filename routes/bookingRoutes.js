/* IMPORTS */
const express = require("express");
const { getCheckoutSession } = require("../controllers/bookingController");
const { protect, restrict } = require("../controllers/authController");

/* ROUTER */
const router = express.Router();

router.get("/checkout-session/:tourID", protect, getCheckoutSession);

module.exports = router;
