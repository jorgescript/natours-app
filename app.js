/* IMPORTS */
const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

/* EJECUTAR EXPRESS */
const app = express();

/* MIDDLEWARE */
/* Logger que nos brinda información sobre las peticiones http */
app.use(morgan("dev"));
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

module.exports = app;
