const axios = require('axios');
const { MongoClient } = require('mongodb');
const fs = require('fs');

// MongoDB Atlas connection string
const atlasUri = "mongodb+srv://wojciechkoba3:oGypLdQnBkG4NB95@twitch-chat-tracker.fcwdt.mongodb.net/?retryWrites=true&w=majority&appName=Twitch-chat-tracker";
const client = new MongoClient(atlasUri, { useNewUrlParser: true, useUnifiedTopology: true });

// Database and collection names
const dbName = "emote_database";  // Replace if needed
const collectionName = "emote_collection";

// Read the IDs and usernames from 'username.txt'
const idNamePairs = fs.readFileSync('username.txt', 'utf-8').split('\n').map(line => line.trim().split(' '));

// Function to get emotes for a given ID
async function getEmotes(emoteSetId, username) {
  const url = `https://7tv.io/v3/emote-sets/${emoteSetId}`;

  try {
    // Send a GET request to the API
    const response = await axios.get(url);

    // Initialize the result object
    const result = { username: username, emotes: [] };

    // Extract emotes from the response data
    result.emotes = response.data.emotes.map(emote => ({ name: emote.name, id: emote.id }));

    // Insert the result into the database
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    await collection.insertOne(result);
    console.log(`Inserted data for ${username}`);
  } catch (error) {
    console.error(`Failed to fetch emotes for ${username} with ID ${emoteSetId}: ${error.message}`);
  }
}

// Connect to MongoDB Atlas
async function run() {
  try {
    await client.connect();

    // Process each ID and username pair
    for (const [emoteSetId, username] of idNamePairs) {
      await getEmotes(emoteSetId, username);
    }

    console.log("Done processing all emote sets!");
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  } finally {
    await client.close();
  }
}

run();
