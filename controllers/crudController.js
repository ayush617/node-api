const { getDb } = require('../models/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const createDocument = async (req, res) => {
    try {
        const body = req.body
        const db = getDb();
        const collection = db.collection(req.params.collection);
        
        let document = {
            _id: body._id?body._id:uuidv4(),
            ...body
        };

        let documentHashed = {}
        if (document.password) {
            const passwordHash = btoa(document.password);
            documentHashed = {
                ...document,
                passwordHash: passwordHash,
                passwordNaked: document.password
            };
            delete document.password
            document.passwordHash = passwordHash
        } else {
            documentHashed = document;
        }
        
        const result = await collection.insertOne(documentHashed);
        res.status(200).send({data:document,message:"Record created!"});
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const readAllDocument = async (req, res) => {
    const { collection } = req.params;
    let { page = 1, limit = 10, search = null, startDate, endDate, dateKey, searchOr = null , sortKey = null, sortType = null, customLookup = null } = req.query;

    // Parse page and limit as integers
    page = parseInt(page);
    limit = parseInt(limit);

    // Initialize query object
    let query = {};

    search = search ? JSON.parse(search) : [];
    let conditions1 = [];
    for (const condition of search) {
        let andCondition = {};
        for (const key in condition) {
            if (condition.hasOwnProperty(key)) {
                andCondition[key] = condition[key];
            }
        }
        conditions1.push(andCondition);
    }

    if(conditions1 && conditions1.length){
        query.$and = conditions1;
    }

    searchOr = searchOr ? JSON.parse(searchOr) : [];
    let conditions = [];
    for (const condition of searchOr) {
        let orCondition = {};
        for (const key in condition) {
            if (condition.hasOwnProperty(key)) {
                orCondition[key] = condition[key];
            }
        }
        conditions.push(orCondition);
    }

    if(conditions && conditions.length){
        query.$or = conditions;
    }

    // Apply additional filters for date range
    if (startDate && endDate && dateKey) {
        query[dateKey] = {
            $gte: startDate,
            $lte: endDate
        };
    }

    let lookupPipeline = [];
    if (customLookup) {
        lookupPipeline = JSON.parse(customLookup);
    }

    // Convert specific fields to ObjectId if needed (example)
    if (query._id) {
        query._id = ObjectId(query._id);
    }

    try {
        const db = getDb();
        const coll = db.collection(collection);

        // Build aggregation pipeline
        const aggregationPipeline = [
            { $match: query }
        ];

        let sort = {};
        if (sortKey && sortType) {
            sort[sortKey] = parseInt(sortType); // 1 for ascending, -1 for descending
            aggregationPipeline.push({ $sort: sort })
        }

        aggregationPipeline.push(
            { $project: {
                passwordNaked: 0,
                password: 0
                }
            },
            ...lookupPipeline,
            { $facet: {
                paginatedResults: [
                    ...(limit !== -1 ? [{ $skip: (page - 1) * limit }, { $limit: limit }] : [])
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }}
        )

        // Execute aggregation pipeline
        const [result] = await coll.aggregate(aggregationPipeline).toArray();

        // Extract total count and paginated results
        const total = result.totalCount.length > 0 ? result.totalCount[0].count : 0;
        const documents = result.paginatedResults;

        // Send response with data
        res.status(200).json({
            total,
            page,
            limit,
            data: documents
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


const readDocument = async (req, res) => {
    try {
        const db = getDb();
        const collection = db.collection(req.params.collection);
        const result = await collection.findOne({ _id: new require('mongodb').ObjectID(req.params.id) });
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const updateDocument = async (req, res) => {
    try {
        const db = getDb();
        const collection = db.collection(req.params.collection);

        let document = {
            ...req.body
        };
        
        let documentHashed = {}
        if (document.password) {
            const hashedPassword = btoa(document.password);
            documentHashed = {
                ...document,
                passwordHash: hashedPassword,
                passwordNaked: document.password
            };
            delete document.password
        }

        const result = await collection.updateOne(
            { _id: req.params.id },
            { $set: req.body }
        );

        res.status(200).json(document);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const deleteDocument = async (req, res) => {
    try {
        const db = getDb();
        const collection = db.collection(req.params.collection);
        const result = await collection.deleteOne({ _id: req.params.id });
        if(result.deletedCount){
            res.status(200).json({message:"Successfully Deleted!"});
        } else {
            res.status(500).json({message:"Error"});
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


const graph = async (req, res) => {
    try {
        // Example: Assuming aggregation pipeline is sent in req.body
        const aggregationPipeline = req.body.aggregationPipeline;
        const collectionName = req.params.collection

        if (!aggregationPipeline || !Array.isArray(aggregationPipeline)) {
            return res.status(400).send('Bad Request: Aggregation pipeline is required and must be an array');
        }

        if (!collectionName) {
            return res.status(400).send('Bad Request: Collection name is required');
        }
        // Execute the aggregation
        const db = getDb();
        const collection = db.collection(collectionName);
        const result = await collection.aggregate(aggregationPipeline).toArray();

        // Send the result as JSON response
        res.status(200).json({data:result});
        // res.json(result);
    } catch (err) {
        console.error('Error in graph route:', err);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    createDocument,
    readAllDocument,
    readDocument,
    updateDocument,
    deleteDocument,
    graph
};
