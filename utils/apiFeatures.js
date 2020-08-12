class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    /* Creamos una copia del objeto query (?duration=5...)*/
    const queryObj = { ...this.queryString };
    /* Quitamos las palabras reservadas para nuestra app */
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((field) => delete queryObj[field]);
    /* Convertimos el objeto en un string para añadir los filtros avanzados */
    let queryStr = JSON.stringify(queryObj);
    /* Reemplazamos las palabras con la misma palabra pero con un signo $ delante */
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    /* Ordenamiento */
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-ratingsAverage");
    }
    return this;
  }

  limit() {
    /* Limitar campos */
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    /* Paginación */
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
