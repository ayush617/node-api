const express = require('express');

const router = express.Router();
const sendMailController = require('../controllers/emailController');

// Define a route for sending emails (GET method)
router.get('/sendmail', sendMailController.sendMail);

module.exports = router;
