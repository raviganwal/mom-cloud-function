import {firestore} from "firebase-admin";
import Stripe from "stripe";

export const getCustomer = async (stripe: Stripe, email: string, name: string, uid:string) => {
  let customer: Stripe.Customer;
  const customers = await stripe.customers.search({
    // eslint-disable-next-line
        query: `email:\'${email}\'`,
  });
  console.log("customers ", customers.data);
  if (customers.data.length > 0) {
    customer = customers.data[0];
    await firestore().collection("users").doc(uid).update({
      stripeCustomerId: customer.livemode ? customer.id : null,
      stripeCustomerIdTest: customer.livemode ? null : customer.id,
    });
  } else {
    customer = await stripe.customers.create({
      email: email,
      name: name,
      metadata: {
        uid: uid,
      },
    });
    // add uid in stripe customer response and save it in firestore
    // await firestore().collection("stripe_customers").doc(uid).set(customer);
    await firestore().collection("users").doc(uid).set({
      uid: uid,
      stripeCustomerId: customer.livemode ? customer.id : null,
      stripeCustomerIdTest: customer.livemode ? null : customer.id,
    });
  }
  return customer;
};
