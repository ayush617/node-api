const { getDb } = require('../models/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const login = async (req, res) => {
    try {
        let { email, userName, password } = req.body
        const passwordHash = btoa(password);
        const db = getDb();
        const collection = db.collection("users");
        const result = await collection.findOne({
            $or: [
              { email: email },
            //   { userName: userName }
            ],
            // passwordHash: passwordHash
          });
          
        if(!result){
            res.status(401).send('Invalid UserName or Email');
            return
        } 
        

        if (passwordHash != result?.passwordHash) {
            res.status(401).send('Invalid Credentials');
            return;
        }

        const collection1 = db.collection("authToken");
        const result2 = await collection1.findOne({
            userId: result._id
          });

        if(!result2){
            let document = {
                _id: uuidv4(),
                userId: result._id
            };
            const result1 = await collection1.insertOne(document);
            result.authToken = document._id;
        } else {
            result.authToken = result2._id;
        }

        const collection2 = db.collection("organizations");
        const result3 = await collection2.findOne({
            _id: result.organizationId
          });
        
        if(result3){
            result.organizationName = result3.name;
        }

        // const date = new Date();
        // const year = date.getFullYear();
        // const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        // const day = String(date.getDate()).padStart(2, '0');

        // let todayDate = `${year}-${month}-${day}`;

        // const collection3 = db.collection("attendance");
        // const result4 = await collection3.findOne({
        //     userId: result._id,
        //     date: todayDate
        //   });
        
        // result.presentToday = result4? true : false;

        delete result?.password;
        delete result?.passwordHash;
        delete result?.passwordNaked;
        
        res.status(200).json({data:result, message:"Login successful!"});

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const auth = async (req, res) => {
    try {
        let { authToken } = req.body
        const db = getDb();
        const collection = db.collection("authToken");
        const result = await collection.findOne({
            _id: authToken
          });
          
        if(!result){
            res.status(401).send('Session Not Found');
            return
        } 

        const collection1 = db.collection("users");
        const result1 = await collection1.findOne({
            _id: result.userId
        });
        
        if(!result1){
            res.status(401).send('User Not Found');
            return
        } 

        result1.authToken = authToken;

        delete result1?.password;
        delete result1?.passwordHash;
        delete result1?.passwordNaked;
        
        res.status(200).json(result1);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const signout = async (req, res) => {
    try {
        const { authToken } = req.body;
        if (!authToken) {
            return res.status(400).send('authToken is required');
        }
        const db = getDb();
        const collection = db.collection("authToken");
        const result = await collection.deleteOne({ _id: authToken });       
        if (result.deletedCount === 1) {
            return res.status(200).json({ message: "Logout!" });
        } else {
            return res.status(404).send('Session Not Found');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};


module.exports = {
    login,
    auth,
    signout
};