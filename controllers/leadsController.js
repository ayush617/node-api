const { getDb } = require('../models/db');

const createLead = async (req, res) => {
    try {
        const dbName = req.params.dbName;
        const database = getDb(dbName?dbName:'');
        const collection = database.collection('leads');
        const result = await collection.insertOne(req.body);
        res.status(200).send('Request received successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    createLead
};
