import "@babel/polyfill";
import { displayMap } from "./mapbox";
import { login, logout } from "./login";
import { updateSetings } from "./updateSetings";
import { bookTour } from "./stripe";

/* CREATE DOM ELEMENTS */
const mapbox = document.getElementById("map");
const loginForm = document.querySelector(".form--login");
const logoutBtn = document.querySelector(".nav__el--logout");
const emailInput = document.getElementById("email");
const nameInput = document.getElementById("name");
const photoInput = document.getElementById("photo");
const passwordInput = document.getElementById("password");
const passwordCurrentInput = document.getElementById("password-current");
const passwordConfirmInput = document.getElementById("password-confirm");
const formData = document.querySelector(".form-user-data");
const formPassword = document.querySelector(".form-user-password");
const bookBtn = document.getElementById("book-tour");

/* MAPBOX */
if (mapbox) {
  const locations = JSON.parse(mapbox.dataset.locations);
  displayMap(locations);
}

/* LOG IN */
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    login(email, password);
  });
}

/* LOG OUT */
if (logoutBtn) {
  logoutBtn.addEventListener("click", function (e) {
    //e.preventDefault();
    logout();
  });
}

/* UPDATDE DATA */
if (formData) {
  formData.addEventListener("submit", function (e) {
    e.preventDefault();
    const form = new FormData();
    form.append("name", nameInput.value);
    form.append("email", emailInput.value);
    form.append("photo", photoInput.files[0]);
    updateSetings(form, "data");
  });
}

/* UPDATDE PASSWORD */
if (formPassword) {
  formPassword.addEventListener("submit", async function (e) {
    e.preventDefault();
    const passwordCurrent = passwordCurrentInput.value;
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;
    await updateSetings(
      { passwordCurrent, password, passwordConfirm },
      "password"
    );
    passwordCurrentInput.value = "";
    passwordInput.value = "";
    passwordConfirmInput.value = "";
  });
}

/* STRIPE */
if (bookBtn) {
  bookBtn.addEventListener("click", function (e) {
    const tourID = e.target.dataset.tourId;
    e.target.textContent = "Processing...";
    bookTour(tourID);
  });
}
