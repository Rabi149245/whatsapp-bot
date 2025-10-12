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
        text: { body: "Merci pour votre message 👋" },
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
