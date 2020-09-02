const Tour = require("../models/tourModel");
const CatchAsync = require("../utils/catchAsync");
const catchAsync = require("../utils/catchAsync");
/* ROUTES HANDLERS */
exports.getOverview = CatchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render("overview", {
    title: "All tours",
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fileds: "review, rating user",
  });
  res.status(200).render("tour", {
    title: tour.name,
    tour,
  });
});
