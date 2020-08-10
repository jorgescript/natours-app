const fs = require("fs");

/* LEER DATA */
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  if (id > tours.length) {
    return res.status(404).json({ status: "fail", message: "Invalid ID" });
  }
  const tour = tours.find((tour) => tour.id === id);
  res.status(200).json({ status: "success", data: { tour } });
};

exports.createTour = (req, res) => {
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

exports.upadateTour = (req, res) => {
  const id = req.params.id * 1;
  if (id > tours.length) {
    return res.status(404).json({ status: "fail", message: "Invalid ID" });
  }
  res.status(200).json({
    status: "success",
    data: { tour: "Updated tour" },
  });
};

exports.deleteTour = (req, res) => {
  const id = req.params.id * 1;
  if (id > tours.length) {
    return res.status(404).json({ status: "fail", message: "Invalid ID" });
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
};
