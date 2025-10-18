import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

// ✅ Variables à personnaliser
const ACCESS_TOKEN = "TON_JETON_WHATSAPP_CLOUD";
const PHONE_NUMBER_ID = "TON_PHONE_NUMBER_ID";
const VERIFY_TOKEN = "mon_token_de_verif"; // même que celui déclaré dans Meta Developer

// 📌 Vérification du webhook (étape Meta Developer)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 📩 Réception des messages clients WhatsApp
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
    const text = message.text?.body?.toLowerCase() || "";

    console.log("Message reçu :", text);

    // 🧠 Réponses automatiques simples
    let replyText = "";

    if (text.includes("catalogue") || text.includes("prix") || text.includes("tarif")) {
      replyText = "🧺 *Catalogue Pressing Yamba*\nChemise : 500 FCFA\nCostume : 1500 FCFA\nRobe : 800 FCFA\n\nSouhaitez-vous faire une commande ?";
    } 
    else if (text.includes("bonjour") || text.includes("salut")) {
      replyText = "👋 Bonjour et bienvenue chez *Pressing Yamba* !\nNous proposons le lavage, le repassage et le nettoyage à sec de vos vêtements.\n\nTapez *Catalogue* pour voir nos tarifs ou *Commande* pour faire un enlèvement.";
    } 
    else if (text.includes("commande") || text.includes("enlev")) {
      replyText = "🧾 Merci ! Veuillez indiquer les vêtements à traiter et leur quantité. Exemple :\n> 2 chemises, 1 costume.";
    } 
    else {
      replyText = "🤖 Désolé, je n’ai pas compris votre message. Tapez *Catalogue* ou *Commande* pour continuer.";
    }

    // 🚀 Envoi de la réponse via WhatsApp Cloud API
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
        text: { body: replyText },
      }),
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("Erreur webhook :", err);
    res.sendStatus(500);
  }
});

// 🚀 Lancement du serveur
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Serveur Pressing Yamba en ligne sur le port ${PORT}`));
