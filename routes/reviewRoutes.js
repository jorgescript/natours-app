/* IMPORTS */
const express = require("express");
const { protect, restrict } = require("../controllers/authController");
const { createReview, getReviews } = require("../controllers/reviewController");

/* ROUTER */
const router = express.Router({ mergeParams: true });
router.route("/").get(getReviews).post(protect, restrict("user"), createReview);

module.exports = router;
