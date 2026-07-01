require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Home
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API KEY
const G2BULK_KEY = process.env.G2BULK_KEY;
const BASE_URL = "https://api.g2bulk.com/v1";

// ================= GAME MAP =================
const gameCodeMapping = {
    "Mobile Legends": "mlbb",
    "Free Fire": "freefire_id",
    "PUBG Mobile": "pubgm",
    "Call of Duty": "codm",
    "Valorant": "valorant",
    "Blood Strike": "blood_strike",
    "Honor of Kings": "hok"
};

// ================= TEST =================
app.get('/test', (req, res) => {
    res.send("SERVER WORKING OK");
});

// ================= VERIFY PLAYER (DEBUG SIMPLE) =================
app.get('/api/verify-player', (req, res) => {
    res.json({
        success: true,
        message: "API is working"
    });
});

// ================= 🔥 MAIN VERIFY (ALL GAMES FIXED) =================
app.post('/api/games/verify', async (req, res) => {
    try {
        const { game, playerId, zoneId } = req.body;

        if (!game || !playerId) {
            return res.status(400).json({
                success: false,
                message: "game និង playerId ត្រូវការជាចាំបាច់"
            });
        }

        // 🔥 convert game name → API code
        const gameCode =
            gameCodeMapping[game] ||
            game.toLowerCase().replace(/\s/g, "_");

        const response = await axios.post(`${BASE_URL}/games/checkPlayerId`, {
            game: gameCode,
            user_id: playerId,
            server_id: zoneId || "",
            charname: ""
        }, {
            headers: {
                "X-API-Key": G2BULK_KEY
            }
        });

        res.json({
            success: true,
            game: game,
            gameCode: gameCode,
            nickname: response.data.name || "Unknown",
            openid: response.data.openid || null
        });

    } catch (error) {
        console.log("VERIFY ERROR:", error.response?.data || error.message);

        res.status(500).json({
            success: false,
            message: error.response?.data?.message || "Verify failed"
        });
    }
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
