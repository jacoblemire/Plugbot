require("dotenv").config();

const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Twilio sends form data
app.use(express.urlencoded({ extended: false }));

// Health check route (IMPORTANT for Fly)
app.get("/", (req, res) => {
  res.send("WhatsApp AI Bot is running");
});

// Webhook route (Twilio hits this)
app.post("/webhook", async (req, res) => {
  try {
    const userMessage = req.body.Body || "Hello";

    console.log("Incoming message:", userMessage);

    const aiResponse = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    const reply = aiResponse.content[0].text;

    res.set("Content-Type", "text/xml");
    res.send(`
<Response>
  <Message>${reply}</Message>
</Response>
`);

  } catch (error) {
    console.error("Claude error:", error.message);

    res.set("Content-Type", "text/xml");
    res.send(`
<Response>
  <Message>Bot is online but AI failed.</Message>
</Response>
`);
  }
});

// Use Fly-assigned port
const PORT = process.env.PORT || 3000;

// Bind to 0.0.0.0 (REQUIRED for Fly)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
