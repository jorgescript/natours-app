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

/* ROUTER */
const router = express.Router();
router.route("/top-5-cheap").get(aliasTopTours, getAllTours);
router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(getMonthlyPlan);
router.route("/").get(getAllTours).post(createTour);
router.route("/:id").get(getTour).patch(upadateTour).delete(deleteTour);

module.exports = router;
