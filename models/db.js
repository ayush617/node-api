const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGODB_URI;

let client;
let db;

const connectToDb = async () => {
    try {
        client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        db = client.db('mini-coders');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
};

const getDb = () => db;

const closeDbConnection = () => {
    if (client) {
        client.close();
    }
};

module.exports = {
    connectToDb,
    getDb,
    closeDbConnection
};
