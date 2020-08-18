/* IMPORTS */
const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

/* EJECUTAR EXPRESS */
const app = express();

/* MIDDLEWARE */
if (process.env.NODE_ENV === "development") {
  /* Logger que nos brinda información sobre las peticiones http */
  app.use(morgan("dev"));
}
/* Con esto podemos acceder al body del objeto request */
app.use(express.json());
/* Añadimos la fecha de cuando se hizo la petición */
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

/* ROUTING */
/* Tours routes */
app.use("/api/v1/tours", tourRouter);
/* Users routes */
app.use("/api/v1/users", userRouter);
/* routes no definidas */
app.all("*", (req, res, next) => {
  /* Express sabe que si pasamos un argumento e next es un error */
  next(new AppError(`Cant find ${req.originalUrl}`, 404));
});

/* ERRORS */
app.use(globalErrorHandler);

module.exports = app;
