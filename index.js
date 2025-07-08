const express = require('express');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// --- API Endpoint ---
app.post('/api/crip', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const form = new FormData();
  form.append("prompt", prompt);

  const apiKey = "3b805b36da5054768ba24d0fbd42ca96f375845d0cea06a27d901055cce2e6d33a1b2e7154ae64e28bb4c48aca47aab7";

  try {
    const response = await fetch("https://clipdrop-api.co/text-to-image/v1", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        ...form.getHeaders()
      },
      body: form
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: errorText });
    }

    const buffer = await response.buffer();
    const imgPath = path.join(__dirname, "crip_image.png");
    fs.writeFileSync(imgPath, buffer);

    res.sendFile(imgPath, () => fs.unlinkSync(imgPath));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

// --- Fake Messenger Bot Command System ---
const simulateBotCommand = async (command, args) => {
  if (command !== 'crip') {
    console.log('❌ Unknown command');
    return;
  }

  const prompt = args.join(" ");
  if (!prompt) {
    console.log("❌ Please enter a prompt.\nExample: crip vaporwave fashion dog in miami");
    return;
  }

  console.log(`⏳ Generating image for: ${prompt}`);

  const response = await fetch('http://localhost:' + PORT + '/api/crip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ API Error:', error);
    return;
  }

  const dest = path.join(__dirname, 'bot_crip_image.png');
  const fileStream = fs.createWriteStream(dest);
  response.body.pipe(fileStream);

  fileStream.on('finish', () => {
    console.log(`✅ Image saved: ${dest}`);
  });
};

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  // simulateBotCommand("crip", ["vaporwave", "fashion", "dog", "in", "miami"]);
});