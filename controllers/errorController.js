/* IMPORTS */
const AppError = require("../utils/appError");

/* ERROR HANDLING */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplacate field value: ${value}.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  return new AppError(`Invalid input data: ${err.message}`, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res
      .status(err.statusCode)
      .json({ status: err.status, message: err.message });
  } else {
    console.error(err);
    res.status(500).json({ status: "error", message: "Something explote 💥" });
  }
};

module.exports = (err, req, res, next) => {
  /* Propiedades nuevas */
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = {};
    if (err.stack.startsWith("CastError")) error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.stack.startsWith("ValidationError"))
      error = handleValidationErrorDB(err);
    sendErrorProd(error, res);
  }
};
