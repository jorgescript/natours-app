/* IMPORTS */
const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Tour = require("../../models/tourModel");
const { deleteMany } = require("../../models/tourModel");

/* VARIABLES DE ENTORNO */
dotenv.config({ path: "./config.env" });

/* BASE DE DATOS */
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.PASSWORD);
mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("SUCCESSFUL CONECTION"));

/* READ FILE */
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, "utf-8")
);

/* IMPORT DATA TO DB */
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("Data successfully imported");
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

/* DELETE DATA FROM DB */
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("Data successfully deleted");
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
