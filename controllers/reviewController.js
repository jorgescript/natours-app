/* IMPORTS */
const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");

/* ROUTES HANDLERS */
exports.getReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  /* Validamos si existe el parametro */
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter);
  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: { reviews },
  });
});
exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: "success",
    data: { review: newReview },
  });
});
