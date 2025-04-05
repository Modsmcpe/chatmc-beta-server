const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// GitHub config
const GITHUB_USERNAME = 'Modsmcpe'; // Your GitHub username
const REPO_NAME = 'chatmc-beta-server'; // The repo name
const TOKEN = process.env.GITHUB_TOKEN;
const BRANCH = 'main';

const uploadToGitHub = async (filename, content) => {
    const encodedContent = Buffer.from(content).toString('base64');

    const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/chatlogs/${filename}`;

    try {
        await axios.put(
            url,
            {
                message: `Upload chat log ${filename}`,
                content: encodedContent,
                branch: BRANCH,
            },
            {
                headers: {
                    Authorization: `token ${TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log(`✅ Uploaded ${filename} to GitHub`);
    } catch (err) {
        console.error(`❌ GitHub upload failed for ${filename}:`, err.response?.data || err.message);
    }
};

// Save logs locally + upload
app.post('/api/chatlog', async (req, res) => {
    const { playerId, chatLog } = req.body;
    if (!playerId || !chatLog) {
        return res.status(400).send("Invalid data");
    }

    const filename = `${playerId}_${Date.now()}.json`;
    const localPath = path.join(__dirname, 'chatlogs', filename);
    fs.mkdirSync('chatlogs', { recursive: true });
    fs.writeFileSync(localPath, JSON.stringify(chatLog, null, 2));

    console.log("Saved chat log for", playerId);
    res.send("Chat log received.");

    // Upload to GitHub
    await uploadToGitHub(filename, JSON.stringify(chatLog, null, 2));
});

// Version check
app.get('/api/latestversion', (req, res) => {
    res.json({ stableVersion: "2.5-beta" });
});

// List logs (local only)
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
