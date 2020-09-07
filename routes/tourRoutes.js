/* IMPORTS */
const express = require("express");
const {
  aliasTopTours,
  createTour,
  deleteTour,
  getAllTours,
  getDistances,
  getMonthlyPlan,
  getTour,
  getTourStats,
  getToursWithin,
  resizeTourImages,
  upadateTour,
  uploadTourImages,
} = require("../controllers/tourController");
const { protect, restrict } = require("../controllers/authController");
const reviewRouter = require("./reviewRoutes");

/* ROUTER */
const router = express.Router();
/* Nested rout review */
router.use("/:tourId/reviews", reviewRouter);

/* Top 5 tours and tour stats */
router.route("/top-5-cheap").get(aliasTopTours, getAllTours);
router.route("/tour-stats").get(getTourStats);

/* Geospatial data */
router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(getToursWithin);

router.route("/distances/:latlng/unit/:unit").get(getDistances);

/* get monnthly plan */
router
  .route("/monthly-plan/:year")
  .get(protect, restrict("admin", "lead-guide", "guide"), getMonthlyPlan);

/* get all tours and create tour */
router
  .route("/")
  .get(getAllTours)
  .post(protect, restrict("admin", "lead-guide"), createTour);

/* get tour, update tour and delete tour */
router
  .route("/:id")
  .get(getTour)
  .patch(
    protect,
    restrict("admin", "lead-guide"),
    uploadTourImages,
    resizeTourImages,
    upadateTour
  )
  .delete(protect, restrict("admin", "lead-guide"), deleteTour);

module.exports = router;
