/* IMPORTS */
const express = require("express");
const fs = require("fs");
const morgan = require("morgan");

/* EJECUTAR EXPRESS */
const app = express();

/* MIDDLEWARE */
/* Logger que nos brinda información sobre las peticiones http */
app.use(morgan("dev"));
/* Con esto podemos acceder al body del objeto request */
app.use(express.json());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

/* LEER DATA */
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

/* ROUTING HANDLERS */
const getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
};

const getTour = (req, res) => {
  const id = req.params.id * 1;
  if (id > tours.length) {
    return res.status(404).json({ status: "fail", message: "Invalid ID" });
  }
  const tour = tours.find((tour) => tour.id === id);
  res.status(200).json({ status: "success", data: { tour } });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  /* Junta en un solo objeto los objetos que pasemos por parametros */
  const newTour = Object.assign({ id: newId }, req.body);
  /* Añadimos el nuevo tour al array original */
  tours.push(newTour);
  /* Sobreescribimos el archivo con el nuevo array */
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({ status: "success", data: { tour: newTour } });
    }
  );
};

const upadateTour = (req, res) => {
  const id = req.params.id * 1;
  if (id > tours.length) {
    return res.status(404).json({ status: "fail", message: "Invalid ID" });
  }
  res.status(200).json({
    status: "success",
    data: { tour: "Updated tour" },
  });
};

const deleteTour = (req, res) => {
  const id = req.params.id * 1;
  if (id > tours.length) {
    return res.status(404).json({ status: "fail", message: "Invalid ID" });
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
};

/* ROUTING */
app.route("/api/v1/tours").get(getAllTours).post(createTour);
app
  .route("/api/v1/tours/:id")
  .get(getTour)
  .patch(upadateTour)
  .delete(deleteTour);

/* SERVER */
app.listen(3000, () => {
  console.log("App runing on port 3000");
});
