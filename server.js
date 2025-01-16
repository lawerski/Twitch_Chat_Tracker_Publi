const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoClient } = require('mongodb');


const MONGO_URI = ``;
const DATABASE_NAME = "";
const COLLECTION_NAME = "";

const app = express();
app.use(cors());
app.use(express.json());

let collection;

async function connectToMongo() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db(DATABASE_NAME);
        collection = db.collection(COLLECTION_NAME);
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

connectToMongo();


mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });


const channelMetricsSchema = new mongoose.Schema({}, { strict: false });
const ChannelMetrics = mongoose.model(COLLECTION_NAME, channelMetricsSchema, COLLECTION_NAME);

app.get('/metrics', async (req, res) => {
    try {
        const metrics = await ChannelMetrics.find(); 
        res.json(metrics);
    } catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).send(error.message);
    }
});

app.get('/search', async (req, res) => {
    const { channel, username } = req.query;

    if (!collection) {
        return res.status(500).json({ error: 'Database not initialized' });
    }

    try {
        let query = {};

        if (channel) {
            query.channel = channel;
        }
        if (username) {
            query[`metrics.messages.${username}`] = { $exists: true };
        }

        const results = await collection.find(query).toArray();
        res.json(results);
    } catch (err) {
        console.error('Search Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

l
app.get('/aggregate', async (req, res) => {
    if (!collection) {
        return res.status(500).json({ error: 'Database not initialized' });
    }

    try {
        const aggregationPipeline = [
            {
                $project: {
                    channel: 1,
                    messages: { $objectToArray: "$metrics.messages" }, 
                },
            },
            {
                $unwind: "$messages", 
            },
            {
                $group: {
                    _id: { channel: "$channel", user: "$messages.k" }, 
                    totalMessages: { $sum: "$messages.v" }, 
                },
            },
            {
                $sort: { "_id.channel": 1, totalMessages: -1 }, 
            },
            {
                $group: {
                    _id: "$_id.channel", 
                    topUser: { $first: "$_id.user" }, 
                    messageCount: { $first: "$totalMessages" }, 
                },
            },
            {
                $sort: { _id: 1 },
            },
        ];

        const aggregatedData = await collection.aggregate(aggregationPipeline).toArray();
        res.json(aggregatedData);
    } catch (err) {
        console.error('Aggregation Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = 5001;
app.listen(PORT,'0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
