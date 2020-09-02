/* IMPORTS */
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewsRouter = require("./routes/viewRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

/* EJECUTAR EXPRESS */
const app = express();

/* CONFIGURANDO PUG */
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

/* GLOBAL MIDDLEWARE */
/* Archivos estaticos */
app.use(express.static(path.join(__dirname, "public")));

if (process.env.NODE_ENV === "production") {
  /* Establece encabezados http seguros */
  app.use(helmet());
}

if (process.env.NODE_ENV === "development") {
  /* Logger que nos brinda información sobre las peticiones http */
  app.use(morgan("dev"));
}

/* Limita las peticiones a la API */
const limiter = rateLimit({
  /* Maximo 100 peticiones por hora en una misma ip */
  max: 100,
  windowMs: 60 * 6 * 1000,
  message: "Too many request from this IP, try again in an hour",
});
app.use("/api", limiter);

/* Con esto podemos acceder al body del objeto request y establece el limite de datos que se pueden enviar*/
app.use(express.json({ limit: "10kb" }));

/* Sanitización de los datos query injection */
app.use(mongoSanitize());

/* Sanitización de los datos XSS */
app.use(xss());

/* Previene la contamienación de parametros */
app.use(
  hpp({
    whitelist: [
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "duration",
      "price",
    ],
  })
);

/* Añadimos la fecha de cuando se hizo la petición */
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

/* ROUTING */
/* VIEWS */
app.use("/", viewsRouter);

/* API */
/* Tours routes */
app.use("/api/v1/tours", tourRouter);
/* Users routes */
app.use("/api/v1/users", userRouter);
/* Review routes */
app.use("/api/v1/reviews", reviewRouter);

/* RUTAS NO DEFINIDAS */
app.all("*", (req, res, next) => {
  /* Express sabe que si pasamos un argumento e next es un error */
  next(new AppError(`Cant find ${req.originalUrl}`, 404));
});

/* ERRORS */
app.use(globalErrorHandler);

module.exports = app;
