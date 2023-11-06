import admin = require("firebase-admin");

const serviceAccount = require("../momapp-servicekey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://momapp-wellbeing.firebaseio.com",
});

export * from "./subscripton/create-subscription";
