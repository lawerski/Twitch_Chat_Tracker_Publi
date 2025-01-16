const tmi = require('tmi.js');
const fetch = require('node-fetch');
const { MongoClient } = require('mongodb');
const cron = require('node-cron');
require('log-timestamp');

const MONGO_URI = "";
const DATABASE_NAME = "";
const COLLECTION_NAME = "";
const TWITCH_CLIENT_ID = "";
const TWITCH_ACCESS_TOKEN = "";

const metrics = {};
const liveStatus = {}; 
const channelNames = ['YoungMulti', 'xmerghani', 'NEEXcsgo', 'Grendy', 'Nervarien', 'EWROON', 'H2P_Gucio', 'IzakOOO', 'RybsonLoL_', 'BanduraCartel', 'ToJaDenis', 'pisicela', 'qlnek', 'PLKDAMIAN', 'MrDzinold', 'Putrefy', 'ZONY', 'Fatek_', 'xntentacion', 'sawardega', 'revo_toja', 'Kaseko', 'PAGO3'];


const client = new MongoClient(MONGO_URI);
let db;
(async () => {
    try {
        await client.connect();
        db = client.db(DATABASE_NAME);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1);
    }
})();


async function isChannelLive(channelName) {
    const url = `https://api.twitch.tv/helix/streams?user_login=${channelName}`;
    const headers = {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${TWITCH_ACCESS_TOKEN}`
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            console.error(`API error for ${channelName}: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        return data.data && data.data.length > 0 ? data.data[0] : null; 
    } catch (err) {
        console.error(`Error checking live status for ${channelName}:`, err);
        return null;
    }
}

function ensureMetrics(channel) {
    if (!metrics[channel]) {
        metrics[channel] = {
            messages: {},
            replies: {},
            xdCount: {},
            plusOne: 0,
            minusOne: 0,
            mentions: {},
            timeouts: {}
        };
    }
}


async function saveMetricsForStream(channel, streamData) {
    try {
        const streamId = streamData.id; 
        console.log(`Saving metrics for stream ID ${streamId} on channel ${channel}.`);

        ensureMetrics(channel);
        const channelMetrics = metrics[channel];

        await db.collection(COLLECTION_NAME).updateOne(
            { channel, streamId }, 
            {
                $set: {
                    metrics: channelMetrics,
                    lastUpdated: new Date(),
                    streamInfo: streamData 
                }
            },
            { upsert: true } 
        );

        console.log(`Metrics saved for channel: ${channel}, stream ID: ${streamId}.`);


        metrics[channel] = {
            messages: {},
            replies: {},
            xdCount: {},
            plusOne: 0,
            minusOne: 0,
            mentions: {},
            timeouts: {}
        };

        console.log(`Metrics reset for channel ${channel}.`);
    } catch (err) {
        console.error(`Error saving metrics for channel ${channel}:`, err);
    }
}

const twitchClient = new tmi.Client({
    options: { debug: false },
    connection: { reconnect: true },
    channels: channelNames.map(name => `#${name}`)
});

twitchClient.on('message', (channel, userstate, message, self) => {
    if (self) return;

    const cleanChannel = channel.replace('#', '').toLowerCase();

    if (!liveStatus[cleanChannel]) {
        console.log(`Message received in ${cleanChannel}, but the channel is not live.`);
        return;
    }

    ensureMetrics(cleanChannel);
    const user = userstate.username;
    const channelMetrics = metrics[cleanChannel];



    channelMetrics.messages[user] = (channelMetrics.messages[user] || 0) + 1;

    if (message.includes(`@${cleanChannel}`)) {
        channelMetrics.replies[user] = (channelMetrics.replies[user] || 0) + 1;
    }


    if (message.toLowerCase().includes('xd')) {
        channelMetrics.xdCount[user] = (channelMetrics.xdCount[user] || 0) + 1;
    }

    if (message.includes('+1')) {
        channelMetrics.plusOne++;
    }
    if (message.includes('-1')) {
        channelMetrics.minusOne++;
    }
});


cron.schedule('* * * * *', async () => {
    console.log("Checking live channels...");

    for (const channel of channelNames) {
        const normalizedChannel = channel.toLowerCase();
        const streamData = await isChannelLive(normalizedChannel);

        if (streamData) {
            if (!liveStatus[normalizedChannel]) {
                console.log(`${channel} is now live!`);
            }
            liveStatus[normalizedChannel] = true;
            await saveMetricsForStream(normalizedChannel, streamData);
        } else {
            if (liveStatus[normalizedChannel]) {
                console.log(`${channel} went offline.`);
            }
            liveStatus[normalizedChannel] = false;
        }
    }

    console.log("Updated liveStatus:", liveStatus);
});


(async () => {
    try {
        await twitchClient.connect();
        console.log("Twitch Client connected");
    } catch (err) {
        console.error("Failed to connect Twitch Client:", err);
    }
})();
