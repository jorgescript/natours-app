const Tour = require("../models/tourModel");
const CatchAsync = require("../utils/catchAsync");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

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
  if (!tour) next(new AppError("There is no tour for that name", 404));
  res.status(200).render("tour", {
    title: tour.name,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Log into your account",
  });
};
