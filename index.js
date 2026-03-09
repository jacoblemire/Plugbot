require("dotenv").config();

const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

app.use(express.urlencoded({ extended: false }));

app.post("/webhook", async (req, res) => {
  try {

    const userMessage = req.body.Body || "Hello";

    console.log("Incoming message:", userMessage);

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    const reply = response.content[0].text;

    res.type("text/xml");
    res.send(`
<Response>
<Message>${reply}</Message>
</Response>
`);

  } catch (error) {

    console.log("Claude error:", error.message);

    res.type("text/xml");
    res.send(`
<Response>
<Message>Bot is online but AI failed.</Message>
</Response>
`);

  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
