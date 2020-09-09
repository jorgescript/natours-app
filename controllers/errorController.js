/* IMPORTS */
const AppError = require("../utils/appError");

/* ERROR HANDLING */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  /* FIXME: Ver como traer el valor */
  const value = err.keyValue;
  const message = `Duplacate field value: ${value}.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  return new AppError(`Invalid input data: ${err.message}`, 400);
};

const handleJWTError = () => {
  return new AppError("Invalid token, please log in again", 401);
};

const handleJWTExpired = () => {
  return new AppError("Your token was expired please log in again", 401);
};

/* Mostrara errores en desarrollo */
const sendErrorDev = (err, req, res) => {
  /* API */
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    /* RENDER WEBSITE */
    res.status(err.statusCode).render("error", {
      title: "Sorry something went wrong",
      message: err.message,
    });
  }
};

/* Mostrar errores en producción */
const sendErrorProd = (err, req, res) => {
  /* API */
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res
        .status(err.statusCode)
        .json({ status: err.status, message: err.message });
    }
    return res
      .status(500)
      .json({ status: "error", message: "Something explote 💥" });
  }

  /* RENDER WEBSITE */
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Sorry something went wrong",
      message: err.message,
    });
  }
  /* Programation error */
  return res.status(500).render("error", {
    title: "Sorry something went wrong",
    message: "Something explote 💥 please try again later",
  });
};

module.exports = (err, req, res, next) => {
  /* Propiedades nuevas */
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    console.error(`Something explote 💥 ${err}`);
    let error = { ...err };
    error.message = err.message;
    if (err.stack.startsWith("CastError")) error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.stack.startsWith("ValidationError"))
      error = handleValidationErrorDB(err);
    if (err.name === "JsonWebTokenError") error = handleJWTError(err);
    if (err.name === "TokenExpiredError") error = handleJWTExpired(err);
    sendErrorProd(error, req, res);
  }
};
