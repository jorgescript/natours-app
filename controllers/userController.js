/* IMPORTS */
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { getAll, getOne, deleteOne, updateOne } = require("./handleFactory");

/* MIDDELWARE */
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

/* Actualizar usuario loggeado */
exports.updateMe = catchAsync(async (req, res, next) => {
  /* Creamos un error si el usuario quiere cambiar la contraseña */
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("You send the wrong data", 400));
  }
  /* Filtramos las opciones que se pueden actualizar */
  const filterBody = filterObj(req.body, "name", "email");
  /* Actualizamos los datos del usuario */
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "success", data: { updatedUser } });
});

/* Eminiar usuario loggeado */
exports.deleteMe = catchAsync(async (req, res, next) => {
  /* Actualizamos el estatus de active */
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({ status: "success" });
});

/* Traer usuario */
exports.getUser = getOne(User);
/* Traer todos los usuarios */
exports.getAllUsers = getAll(User);
/* Actualizar usuario */
exports.updateUser = updateOne(User); //No actualizar contraseña con este
/* Elimiar Usuario */
exports.deleteUser = deleteOne(User);
