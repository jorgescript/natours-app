import axios from "axios";
import { showAlert } from "./alerts";

export const bookTour = async (tourID) => {
  const stripe = Stripe("pk_test_JqjOzSlglZsiXmPvpzZJOrpo00SxWQWeWZ");
  try {
    /* traer la sesion del servidor (API) */
    const session = await axios(`/api/v1/bookings/checkout-session/${tourID}`);
    /* Crear el checkout form */
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    showAlert("error", err);
  }
};
