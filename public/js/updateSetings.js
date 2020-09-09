import axios from "axios";
import { showAlert } from "./alerts";

export const updateSetings = async (data, type) => {
  try {
    const url =
      type === "data"
        ? "http://127.0.0.1:3000/api/v1/users/update-my-data"
        : "http://127.0.0.1:3000/api/v1/users/update-my-password";
    const res = await axios({
      method: "PATCH",
      url,
      data,
    });
    if (res.data.status === "success") {
      showAlert("success", `${type.toUpperCase()} UPDATED`);
      location.reload(true);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
