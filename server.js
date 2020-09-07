/* IMPORTS */
const dotenv = require("dotenv");
/* VARIABLES DE ENTORNO */
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");

/* UNCAUGTH EXCEPTION */
process.on("uncaughtException", (err) => {
  console.log({ name: err.name, error: err.message });
  console.log("UNCAUGTH EXCEPTION! Shutting down the server...");
  process.exit(1);
});

/* IMPORT APP */
const app = require("./app");

/* BASE DE DATOS */
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("SUCCESSFUL CONECTION"));

/* SERVER */
const server = app.listen(process.env.PORT, () => {
  console.log(`App runing on port ${process.env.PORT}`);
});

/* UNHANDLER REJECTION */
process.on("unhandledRejection", (err) => {
  console.log({ name: err.name, error: err.message });
  console.log("UNHANDLER REJECTION! Shutting down the server...");
  server.close(() => process.exit(1));
});
