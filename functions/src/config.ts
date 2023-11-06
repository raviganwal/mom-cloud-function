import Stripe from "stripe";

const stripeTest = "sk_test_51NxMcuSBDQQZAdQF7Istd1LJ52OWMX2i8LThf3dV86ve4ApyBoRuULGmGZpp9RATIxhJjZXjDREDOyRaVdoeP2fU00n8is5JxZ";

export const getStripeInstance = () => {
  return new Stripe(stripeTest, {
    apiVersion: "2023-10-16",
  });
};
