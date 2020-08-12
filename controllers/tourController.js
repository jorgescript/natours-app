/* IMPORTS */
const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");

/* ROUTES HANDLERS */
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  next();
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({ status: "success", data: { tour: newTour } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({ status: "success", data: { tour } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

exports.upadateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: { tour },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

/* AGREGATION PIPELINES */
exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};
