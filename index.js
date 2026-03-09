require("dotenv").config();

const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Twilio sends data as form-urlencoded
app.use(express.urlencoded({ extended: false }));

// Webhook endpoint Twilio calls
app.post("/webhook", async (req, res) => {
  try {
    const userMessage = req.body.Body;
    const from = req.body.From;

    console.log(`Message from ${from}: ${userMessage}`);

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    const reply = response.content[0].text;

    console.log(`Claude reply: ${reply}`);

    res.set("Content-Type", "text/xml");
    res.send(`
<Response>
<Message>${escapeXml(reply)}</Message>
</Response>
`);
  } catch (error) {
    console.error("Error:", error);

    res.set("Content-Type", "text/xml");
    res.send(`
<Response>
<Message>Something went wrong.</Message>
</Response>
`);
  }
});

// escape Claude text so XML doesn't break
function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// REQUIRED for Fly.io
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
