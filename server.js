const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Store chat logs here
app.post('/api/chatlog', (req, res) => {
    const { playerId, chatLog } = req.body;
    if (!playerId || !chatLog) {
        return res.status(400).send("Invalid data");
    }

    const filename = `chatlogs/${playerId}_${Date.now()}.json`;
    fs.mkdirSync('chatlogs', { recursive: true });
    fs.writeFileSync(filename, JSON.stringify(chatLog, null, 2));

    console.log("Saved chat log for", playerId);
    res.send("Chat log received.");
});

// Version check endpoint
app.get('/api/latestversion', (req, res) => {
    res.json({ stableVersion: "1.20-stable" });
});

// NEW: List available logs
app.get('/api/listlogs', (req, res) => {
    const logDir = path.join(__dirname, 'chatlogs');
    try {
        const files = fs.readdirSync(logDir);
        res.json(files);
    } catch (err) {
        res.status(500).send("Could not list logs: " + err.message);
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`ChatMC Beta Server running at http://localhost:${PORT}`);
});