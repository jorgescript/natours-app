const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
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

exports.getMyTours = catchAsync(async (req, res, next) => {
  /* Buscamos todos los bookigns de ese usuario */
  const bookings = await Booking.find({ user: req.user.id });
  /* Guardamos un array con todos los tours de los bookings */
  const tourIDs = bookings.map((booking) => booking.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  res.status(200).render("overview", {
    title: "My Tours",
    tours,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Log into your account",
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account",
  });
};
