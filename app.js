/* IMPORTS */
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewsRouter = require("./routes/viewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
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
  /* Leer más sobre la libreria */
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
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

/* Con esto podemos acceder al body dentro del obj request y establece el limite de datos que se pueden enviar */
app.use(express.json({ limit: "10kb" }));

/* Con esto podemos acceder a las cookies dentro del obj request */
app.use(cookieParser());

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

/* Compress  text*/
app.use(compression());

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
/* Booking router */
app.use("/api/v1/bookings", bookingRouter);

/* RUTAS NO DEFINIDAS */
app.all("*", (req, res, next) => {
  /* Express sabe que si pasamos un argumento e next es un error */
  next(new AppError(`Cant find ${req.originalUrl}`, 404));
});

/* ERRORS */
app.use(globalErrorHandler);

module.exports = app;
