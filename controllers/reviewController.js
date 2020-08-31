/* IMPORTS */
const Review = require("../models/reviewModel");
const {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} = require("./handleFactory");

/* MIDDLEWARES */
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

/* ROUTES HANDLERS */
/* Traer las reviews */
exports.getReviews = getAll(Review);

/* Crear review */
exports.createReview = createOne(Review);
/* Traer review */
exports.getReview = getOne(Review);
/* Actualizar review */
exports.updateReview = updateOne(Review);
/* Eliminar review */
exports.deleteReview = deleteOne(Review);
