/* IMPORTS */
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  /* Enviar respuesta */
  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

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

exports.deleteMe = catchAsync(async (req, res, next) => {
  /* Actualizamos el estatus de active */
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({ status: "success" });
});

exports.getUser = (req, res) => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not defined yet" });
};
exports.createUser = (req, res) => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not defined yet" });
};
exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not defined yet" });
};
exports.deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not defined yet" });
};
