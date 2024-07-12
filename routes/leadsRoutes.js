const express = require('express');
const { createLead } = require('../controllers/leadsController');

const router = express.Router();

router.post('/leads/:dbName?', createLead);

module.exports = router;
