const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

app.get('/api/latestversion', (req, res) => {
    res.json({ stableVersion: "1.20-stable" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`ChatMC Beta Server running at http://localhost:${PORT}`);
});
