const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const cors = require('cors');

const uri = "mongodb://root:ayush321@mini-coders.com:27017/?authMechanism=DEFAULT";

// Enable CORS for all requests
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use(express.json());

let client;

// Connect to MongoDB when the server starts
(async () => {
    try {
        client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
})();

// POST endpoint to save data in the "leads" collection
app.post('/leads', async (req, res) => {
    try {
        // Access the database and collection
        const database = client.db('mini-coders');
        const collection = database.collection('leads');

        // Insert the data from the request body into the collection
        const result = await collection.insertOne(req.body);

        // Respond with the inserted data
        // res.json(result.ops);
        res.status(200).send('Request received successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => {
    console.log('Server ready');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Closing MongoDB connection');
    client.close();
    process.exit();
});
