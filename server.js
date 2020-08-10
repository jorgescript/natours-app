const dotenv = require("dotenv");
/* CONFIGURACION VARIABLES DE ENTORNO */
dotenv.config({ path: "./config.env" });
const app = require("./app");

/* SERVER */
app.listen(process.env.PORT, () => {
  console.log(`App runing on port ${process.env.PORT}`);
});
