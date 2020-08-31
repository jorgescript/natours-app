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

/* ROUTER */
const router = express.Router({ mergeParams: true });
router
  .route("/")
  .get(getReviews)
  .post(protect, restrict("user"), setTourUserIds, createReview);
router
  .route("/:id")
  .get(getReview)
  .delete(protect, restrict("user", "admin"), deleteReview)
  .patch(protect, restrict("user", "admin"), updateReview);

module.exports = router;
