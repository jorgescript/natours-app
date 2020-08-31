/* IMPORTS */
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

/* Crear documento */
exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ status: "success", data: { data: doc } });
  });
};

/* Elmianar documento */
exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    /* Sino existe el documento mandamos un error */
    if (!doc) return next(new AppError("No document found with that ID", 404));
    /* Si existe devolvolvemos el tour */
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
};

/* Traer todos los documentos */
exports.getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    /* Inicio nested GET reviews on tour */
    let filter = {};
    /* Validamos si existe el parametro */
    if (req.params.tourId) filter = { tour: req.params.tourId };
    /* Fin nested GET reviews on tour */
    /* Contruimos la query */
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();
    /* Ejecutamos la query */
    const docs = await features.query; //.explain(); nos da info de la query
    /* Enviar respuesta */
    res.status(200).json({
      status: "success",
      results: docs.length,
      data: { data: docs },
    });
  });
};

/* Traer documento */
exports.getOne = (Model, populateOpt) => {
  return catchAsync(async (req, res, next) => {
    /* Creamos la query */
    let query = Model.findById(req.params.id);
    /* Si existen opciones pupulate las agregamos */
    if (populateOpt) query = query.populate(populateOpt);
    /* Ejecutamos la query */
    const doc = await query;
    /* Sino existe un documento mandamos un error */
    if (!doc) return next(new AppError("No document found with that ID", 404));
    /* Si existe devolvolvemos el documento */
    res.status(200).json({ status: "success", data: { data: doc } });
  });
};

/* Actualizar documento */
exports.updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    /* Sino existe un documento mandamos un error */
    if (!doc) return next(new AppError("No document found with that ID", 404));
    /* Si existe devolvolvemos el documento */
    res.status(200).json({
      status: "success",
      data: { data: doc },
    });
  });
};
