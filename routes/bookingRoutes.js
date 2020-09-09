/* IMPORTS */
const express = require("express");
const {
  createBooking,
  deleteBooking,
  getAllBookings,
  getBooking,
  updateBooking,
  getCheckoutSession,
} = require("../controllers/bookingController");
const { protect, restrict } = require("../controllers/authController");

/* ROUTER */
const router = express.Router();

router.get("/checkout-session/:tourID", protect, getCheckoutSession);

router
  .route("/")
  .get(protect, restrict("admin", "lead-guide"), getAllBookings)
  .post(protect, restrict("admin", "lead-guide"), createBooking);
router
  .route("/:id")
  .get(protect, restrict("admin", "lead-guide"), getBooking)
  .patch(protect, restrict("admin", "lead-guide"), updateBooking)
  .delete(protect, restrict("admin", "lead-guide"), deleteBooking);

module.exports = router;
