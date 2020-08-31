/* IMPORTS */
const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} = require("./handleFactory");

/* ROUTES HANDLERS */
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  next();
};

exports.getAllTours = getAll(Tour);
/* Crear tour */
exports.createTour = createOne(Tour);
/* Traer un tour */
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
