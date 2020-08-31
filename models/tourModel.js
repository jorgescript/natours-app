/* IMPORTS */
const mongoose = require("mongoose");
const slugify = require("slugify");

/* SCHEMAS */
const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "The name must be unique"],
      required: [true, "A tour must have a name"],
      trimp: true,
      maxlength: [40, "A tour name bust have less or equal then 40 caracters"],
      minlength: [10, "A tour name bust have more or equal then 10 caracters"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "The difficulty must be easy, medium or difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "The minimum rating is 1"],
      max: [5, "The maximum rating is 5"],
      set: (val) => Math.round(val * 10) / 10, // Ej: 4.6666666, 46.666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        message: "The discount must be less o equal the price",
        validator: function (val) {
          return val <= this.price;
        },
      },
    },
    summary: {
      type: String,
      trimp: true,
      required: [true, "A tour must have a description"],
    },
    description: {
      type: String,
      trimp: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    /* Geospacial coordinates */
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    /* Embebed document */
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "users",
      },
    ],
  },
  /* propiedades virtuales */
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* INDEXES */
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

/* VIRTUAL PROPERTIES */
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

tourSchema.virtual("reviews", {
  ref: "reviews",
  foreignField: "tour",
  localField: "_id",
});

/* DOCUMENT MIDDELWARE */
tourSchema.pre("save", function (next) {
  /* This apunta la documento actual */
  this.slug = slugify(this.name, { lower: true });
  next();
});
/* tourSchema.post("save", function (doc, next) {
  // doc es el documento actual
  console.log(doc);
  next();
}); */

/* QUERY MIDDLEWARE */
tourSchema.pre(/^find/, function (next) {
  /* this es la query actual */
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

/* tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // docs son los documentos actuales
  console.log(docs);
  next();
}); */

/* AGREGATION MIDDLEWARE */
// tourSchema.pre("aggregate", function (next) {
//   /* This apunta al metodo aggregation actual */
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model("tours", tourSchema);

module.exports = Tour;
