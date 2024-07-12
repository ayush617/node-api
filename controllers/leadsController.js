const { getDb } = require('../models/db');
const sendMailController = require('../controllers/emailController');

const createLead = async (req, res) => {
    try {
        const dbName = req.params.dbName;
        const database = getDb(dbName?dbName:'');
        const collection = database.collection('leads');
        const result = await collection.insertOne(req.body);
        if(result){
            let to = dbName == 'vritosolengg' ? 'vritosolenggsales@gmail.com' : 'ayush.sharma617@gmail.com'
            sendMailController.email(
                {
                    from: 'Mini-Coders <yours authorised email minicoders.help@gmail.com>',
                    to: to,
                    subject: 'You got a lead - Mini-Coders',
                    text: JSON.stringify(req.body),
                    // html: '<h1>Hello from gmail email using API</h1>',
                }
            )
        }
        res.status(200).send('Request received successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    createLead
};
