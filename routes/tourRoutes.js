/* IMPORTS */
const express = require("express");
const {
  createTour,
  deleteTour,
  getAllTours,
  getTour,
  upadateTour,
  checkID,
  checkBody,
} = require("./../controllers/tourController");

/* ROUTER */
const router = express.Router();
router.param("id", checkID);
router.route("/").get(getAllTours).post(checkBody, createTour);
router.route("/:id").get(getTour).patch(upadateTour).delete(deleteTour);

module.exports = router;
