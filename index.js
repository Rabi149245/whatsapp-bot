import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

const ACCESS_TOKEN = "EAFjp0OLvOmEBPn3ekz0C8ivO9PwMJP2MT7lLEuCVingV9wLGetvPZB6pVVfUfEn2ligryEIAxowkZBlBICjPb0GZCaNd9Gk5nR3eIlJL0ErpbDVZBCjG3rukSwgrkp3x9uJNYzjobSVImWCgOtYZBDsFz7xQkw8oEXJ03WVZAlFPujz6wLn7P8przyNSyLhDka6wZDZD";
const PHONE_NUMBER_ID = "840280999166429";

app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "mon_token_de_verif";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode && token === VERIFY_TOKEN) res.status(200).send(challenge);
  else res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) {
      console.log("Webhook reçu sans message utilisateur (pas d'action).");
      return res.sendStatus(200);
    }

    const from = message.from;
    const text = message.text?.body || "";

    console.log("Message reçu :", text);

    await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: { body: "Dear Fatim,
This is your supposed uncle. I am doing well, and so is my family. Business is also going well. How about you and your family?
I am coming back to the country next month. I would like to know if you are already married or not yet. I intend to ask your parents for your hand in marriage if you agree. Please give me an answer.
Kind regards! 👋" },
      }),
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("Erreur webhook :", err);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Serveur en ligne sur le port ${PORT}`));
