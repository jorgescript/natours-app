/* IMPORTS */
const express = require("express");
const { protect, restrict } = require("../controllers/authController");
const {
  createReview,
  getReview,
  getReviews,
  deleteReview,
  updateReview,
  setTourUserIds,
} = require("../controllers/reviewController");
const { get } = require("mongoose");

/* ROUTER */
const router = express.Router({ mergeParams: true });
router
  .route("/")
  .get(getReviews)
  .post(protect, restrict("user"), setTourUserIds, createReview);
router.route("/:id").get(getReview).delete(deleteReview).patch(updateReview);

module.exports = router;
