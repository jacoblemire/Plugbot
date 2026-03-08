require("dotenv").config();

const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Parse URL-encoded bodies that Twilio sends
app.use(express.urlencoded({ extended: false }));

// Twilio sends incoming WhatsApp messages as a POST to this route
app.post("/webhook", async (req, res) => {
  const userMessage = req.body.Body;
  const from = req.body.From;

  console.log(`Message from ${from}: ${userMessage}`);

  // Ask Claude for a reply
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: userMessage }],
  });

  const reply = response.content[0].text;
  console.log(`Claude replied: ${reply}`);

  // Respond with TwiML — Twilio reads this XML and sends the message
  res.set("Content-Type", "text/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(reply)}</Message>
</Response>`);
});

// Sanitize Claude's reply so it doesn't break the XML response
function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`WhatsApp bot running on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
});
