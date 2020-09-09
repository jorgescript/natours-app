/* IMPORTS  */
const mongoose = require("mongoose");
const Tour = require("./tourModel");
const AppError = require("../utils/appError");

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

/* INDEXES */
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

/* STATIC METHODS */
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  /* AGREGATION PIPELINES */
  /* this apunta al modelo actual */
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRatings: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  //console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

/* QUERY MIDDLEWARE */
/* POPULATE */
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.rev = await this.findOne();
  if (!this.rev) {
    next(new AppError("No document found with that ID", 404));
  }
  next();
});

/* DOCUMENT MIDDLEWARE */
reviewSchema.post("save", function () {
  /* this apunta a la review actual */
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.post(/^findOneAnd/, function () {
  this.rev.constructor.calcAverageRatings(this.rev.tour);
});

const Review = mongoose.model("reviews", reviewSchema);
module.exports = Review;
