/* IMPORTS */
const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

/* SCHEMA */
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  email: {
    type: String,
    required: [true, "Please provide a email"],
    unique: [true, "Email already used"],
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please provide a confirm password"],
    validate: {
      /* Solo funciona con los metodos create y save */
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: { type: Boolean, default: true, select: false },
});

/* QUERY MIDDLEWARE */
userSchema.pre(/^find/, function (next) {
  /* this es la query actual */
  this.find({ active: { $ne: false } });
  next();
});

/* AGREGATION MIDDLEWARE */
userSchema.pre("save", async function (next) {
  /* Validamos si se modifico el password */
  if (!this.isModified("password")) return next();
  /* Encriptamos el password */
  this.password = await bcrypt.hash(this.password, 12);
  /* Al poner el confirmPassword como undedined lo eliminamos de la BD */
  this.passwordConfirm = undefined;
  next();
});

/* Agregregamos la fecha de cuando se cambio la contraseña */
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

/* INSTANT METHOD */
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model("users", userSchema);

module.exports = User;
