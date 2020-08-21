/* IMPORTS */
const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

/* ROUTES HANDLERS */
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  next();
};

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({ status: "success", data: { tour: newTour } });
});

exports.getAllTours = catchAsync(async (req, res, next) => {
  /* Contruimos la query */
  const features = new APIFeatures(Tour, req.query)
    .filter()
    .sort()
    .limit()
    .paginate();
  /* Ejecutamos la query */
  const tours = await features.query;
  /* Enviar respuesta */
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: { tours },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate("reviews");
  /* Sino existe un tour mandamos un error */
  if (!tour) return next(new AppError("No tour found with that ID", 404));
  /* Si existe devolvolvemos el tour */
  res.status(200).json({ status: "success", data: { tour } });
});

exports.upadateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  /* Sino existe un tour mandamos un error */
  if (!tour) return next(new AppError("No tour found with that ID", 404));
  /* Si existe devolvolvemos el tour */
  res.status(200).json({
    status: "success",
    data: { tour },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  /* Sino existe un tour mandamos un error */
  if (!tour) return next(new AppError("No tour found with that ID", 404));
  /* Si existe devolvolvemos el tour */
  res.status(204).json({
    status: "success",
    data: null,
  });
});

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
