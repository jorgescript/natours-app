import axios from "axios";
import { showAlert } from "./alerts";

export const bookTour = async (tourID) => {
  const stripe = Stripe("pk_test_JqjOzSlglZsiXmPvpzZJOrpo00SxWQWeWZ");
  try {
    /* traer la sesion del servidor (API) */
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourID}`
    );
    console.log(session);
    /* Crear el checkout form */
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    console.log(err);
    showAlert("error", err);
  }
};
