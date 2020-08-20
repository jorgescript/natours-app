const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JTW_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendToken = (user, statusCode, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }
  user.password = undefined;
  const token = signToken(user._id);
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({ status: "success", token, data: { user } });
};

/* SIGN UP */
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  sendToken(newUser, 201, res);
});

/* LOG IN */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  /* Verificamos que esten los datos que pedimos */
  if (!email || !password)
    return next(new AppError("Please provide email and password", 400));
  /* Verififamos que el usuaio exista y si el password es correcto */
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  /* Si todo es correcto enviamos el token al cliente */
  sendToken(user, 200, res);
});

/* PROTECT ROUTES */
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  /* Traemos el token y verificamos que exista */
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("You are not logged in", 401));
  }
  /* Verificamos el token */
  const decoded = await jwt.verify(token, process.env.JTW_SECRET);
  /* Verificamos si el usuario aun existe */
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does not longer exist",
        401
      )
    );
  }
  /* Verificamos si el usuario cambio de contraseña */
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password please log in again", 401)
    );
  }
  req.user = currentUser;
  next();
});

/* RESTRICT FUNCTIONS */
exports.restrict = (...roles) => {
  return (req, res, next) => {
    /* req contiene el user porque en el metodo protect lo añadimos */
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have persmission to perfom this action", 403)
      );
    }
    next();
  };
};

/* FORGOR PASSWOR */
exports.forgotPassword = catchAsync(async (req, res, next) => {
  /* Traemos el usuario basandonos en el email */
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with that email", 404));
  }
  /* Generamos un token aleatorio */
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  /* Enviamos el email al usuario */
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/reset-password/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your
  new password and password confirm to: ${resetURL}.\n
  If you didn't forget your password, please ignore this email`;
  try {
    await sendEmail({
      email: user.email,
      subejct: "Your password reset token",
      message,
    });
    res.status(200).json({ status: "success", message: "Token send to email" });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending the email. Try again later", 500)
    );
  }
});

/* RESET PASSWORD */
exports.resetPassword = catchAsync(async (req, res, next) => {
  /* Traemos el usuario por medio del resetToken */
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  /* Verificamos que no este expirado el resetToken */
  if (!user) {
    return next(new AppError("Token is inavlid or is expired", 400));
  }
  /* Actualizamos la constraseña */
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  /* Hacemos log in */
  sendToken(user, 200, res);
});

/* UPDATE PASSWORD */
exports.updatePassword = catchAsync(async (req, res, next) => {
  /* Traemos el usuario */
  /* req contiene el user porque en el metodo protect lo añadimos */
  const user = await User.findById(req.user._id).select("+password");
  /* Volvemos a verificar la antigua contraseña antes de cambiarla */
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("The current password is not correct", 401));
  }
  /* Actualizamos la contraseña */
  user.password = req.body.password;
  user.passwordConfirm = req.body.password;
  await user.save();
  /* Hacemos log in */
  sendToken(user, 201, res);
});
