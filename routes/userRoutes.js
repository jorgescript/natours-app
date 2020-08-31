/* IMPORTS */
const express = require("express");
const {
  deleteUser,
  getAllUsers,
  getMe,
  getUser,
  updateUser,
  updateMe,
  deleteMe,
} = require("../controllers/userController");
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
} = require("../controllers/authController");

/* ROUTER */
const router = express.Router();
/* Auth */
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);
router.patch("/update-my-password", protect, updatePassword);
/* User */
router.get("/me", protect, getMe, getUser);
router.patch("/update-my-data", protect, updateMe);
router.delete("/delete-my-user", protect, deleteMe);
router.route("/").get(getAllUsers);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
