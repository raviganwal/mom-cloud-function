import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {getStripeInstance} from "../config";
import {getCustomer} from "./get-customer";
import Stripe from "stripe";
import {firestore} from "firebase-admin";

export const createSubscription = onRequest(async (request: any, response: any) => {
  const stripe = getStripeInstance();
  const {email, name, uid, priceId} = request.body;
  const customer = await getCustomer(stripe, email, name, uid);
  const price = await stripe.prices.retrieve(priceId);
  if (price === undefined || price.active === false) {
    response.status(400).send({error: "price is undefined or inactive"});
  }
  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: customer.id},
    {apiVersion: "2022-11-15"}
  );
  const subscription = await recurringSubscription(stripe, customer.id, priceId);
  const latestInvoice: Stripe.Invoice = subscription.latest_invoice as Stripe.Invoice;
  const paymentIntent: Stripe.PaymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;
  logger.info(`${customer.id} subscription `, subscription);
  await firestore().collection("users").doc(uid).set({
    uid: uid,
    subscriptionId: subscription.id,
    currentPlan: {
      priceId: priceId,
      price: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval,
    },
  });
  response.status(200).send({
    subscriptionId: subscription.id,
    clientSecret: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customerId: customer.id,
  });
});

const recurringSubscription = async (stripe: Stripe, customerId: string, priceId: string) => {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{
      price: priceId,
    }],
    payment_behavior: "default_incomplete",
    payment_settings: {
      save_default_payment_method: "on_subscription",
      payment_method_types: ["card"],
    },
    expand: ["latest_invoice.payment_intent"],
  });
  return subscription;
};
