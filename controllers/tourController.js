/* IMPORTS */
const multer = require("multer");
const sharp = require("sharp");
const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} = require("./handleFactory");
const AppError = require("../utils/appError");

/* MULTER */
/* Save to memory */
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(new AppError("Please upload only images", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

/* MIDDLEWARE */
exports.uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  /* Procesing coverImage */
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  /* Procesing images */
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, index) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);
      req.body.images.push(fileName);
    })
  );
  next();
});

/* ROUTES HANDLERS */
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  next();
};

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, long] = latlng.split(",");
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !long) {
    return next(
      new AppError(
        "Please provide latitud and longitud in the format lat,lng",
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[long, lat], radius] } },
  });
  res
    .status(200)
    .json({ status: "success", results: tours.length, data: { data: tours } });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, long] = latlng.split(",");
  const multiplier = unit === "mi" ? 0.000621371 : 0.001;
  if (!lat || !long) {
    return next(
      new AppError(
        "Please provide latitud and longitud in the format lat,lng",
        400
      )
    );
  }
  /* AGGREGATION PIPELINE */
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [long * 1, lat * 1] },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
  ]);
  res.status(200).json({ status: "success", data: { data: distances } });
});

exports.getAllTours = getAll(Tour);
/* Crear tour */
exports.createTour = createOne(Tour);
/* Traer un tour */
/* Agregamos las reviews (populate) */
exports.getTour = getOne(Tour, { path: "reviews" });
/* Actualizar tour */
exports.upadateTour = updateOne(Tour);
/* Eliminar tour */
exports.deleteTour = deleteOne(Tour);

/* AGREGATION PIPELINES */
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: "$difficulty",
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantityes" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      /* Separa todos los elementos en el campo que se le pase (creara un elemento por cada fecha) */
      $unwind: "$startDates",
    },
    {
      /* Solo seleccionara los elementos que coincidad con las regleas indicadas */
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      /* Agrupa los elemntos por el _id que se le indique */
      $group: {
        _id: { $month: "$startDates" },
        numToursStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      /* Añade campos */
      $addFields: { month: "$_id" },
    },
    {
      /* Elimina campos */
      $project: { _id: 0 },
    },
    {
      /* Ordena el resultado */
      $sort: { month: 1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: { plan },
  });
});
