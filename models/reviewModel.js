/* IMPORTS  */
const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "A review must have a review"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "A review must have a rating"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "tours",
      required: [true, "Review must belong to a tour"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "users",
      required: [true, "Review must belong to a user"],
    },
  },
  /* propiedades virtuales */
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* QUERY MIDDLEWARE */
reviewSchema.pre(/^find/, function (next) {
  /* this.populate({
    path: "tour",
    select: "name",
  }).populate({
    path: "user",
    select: "name photo",
  }); */
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

const Review = mongoose.model("reviews", reviewSchema);
module.exports = Review;
