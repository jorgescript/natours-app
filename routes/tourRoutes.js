/* IMPORTS */
const express = require("express");
const {
  aliasTopTours,
  createTour,
  deleteTour,
  getAllTours,
  getMonthlyPlan,
  getTour,
  getTourStats,
  upadateTour,
} = require("../controllers/tourController");
const { protect, restrict } = require("../controllers/authController");
const reviewRouter = require("./reviewRoutes");

/* ROUTER */
const router = express.Router();
router.use("/:tourId/reviews", reviewRouter);
router.route("/top-5-cheap").get(aliasTopTours, getAllTours);
router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(getMonthlyPlan);
router.route("/").get(protect, getAllTours).post(createTour);
router
  .route("/:id")
  .get(getTour)
  .patch(upadateTour)
  .delete(protect, restrict("admin", "lead-guide"), deleteTour);

module.exports = router;
