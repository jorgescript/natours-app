/* IMPORTS */
const express = require("express");
const fs = require("fs");

/* EJECUTAR EXPRESS */
const app = express();

/* LEER DATA */
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

/* FUNCIONES */
const getAllTours = (req, res) => {
  res
    .status(200)
    .json({ status: "success", results: tours.length, data: { tours } });
};

const getTour = (req, res) => {
  const id = req.params.id * 1;
  if (id > tours.length) {
    res.status(404).json({ status: "fail", message: "Invalid ID" });
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
    res.status(404).json({ status: "fail", message: "Invalid ID" });
  }
  res.status(200).json({
    status: "success",
    data: { tour: "Updated tour" },
  });
};

const deleteTour = (req, res) => {
  const id = req.params.id * 1;
  if (id > tours.length) {
    res.status(404).json({ status: "fail", message: "Invalid ID" });
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
};

/* MIDDLEWARE */
app.use(express.json());

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
