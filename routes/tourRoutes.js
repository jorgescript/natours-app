/* IMPORTS */
const express = require("express");
const {
  createTour,
  deleteTour,
  getAllTours,
  getTour,
  upadateTour,
} = require("./../controllers/tourController");

/* ROUTER */
const router = express.Router();
router.route("/").get(getAllTours).post(createTour);
router.route("/:id").get(getTour).patch(upadateTour).delete(deleteTour);

module.exports = router;
