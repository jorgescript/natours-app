/* IMPORTS */
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app");

/* VARIABLES DE ENTORNO */
dotenv.config({ path: "./config.env" });

/* BASE DE DATOS */
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.PASSWORD);
mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("SUCCESSFUL CONECTION"));

/* SERVER */
app.listen(process.env.PORT, () => {
  console.log(`App runing on port ${process.env.PORT}`);
});
