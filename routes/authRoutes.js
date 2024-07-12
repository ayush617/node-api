const express = require('express');
const { login, auth, signout } = require('../controllers/authController');
const { authorize, getAccessToken } = require('../auth/google-auth');

const router = express.Router();

router.post('/login', login);
router.post('/signout', signout);
router.post('/auth', auth);

// Route to initiate the OAuth process and get the authorization URL
// router.get('/generate-token', authorize);
// Route to handle the callback and save the token
// router.get('/oauth2callback', getAccessToken);

module.exports = router;