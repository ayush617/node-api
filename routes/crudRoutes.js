const express = require('express');
const {
    createDocument,
    readAllDocument,
    readDocument,
    updateDocument,
    deleteDocument,
    graph
} = require('../controllers/crudController');
const router = express.Router();
const authMiddleware = require('../middlewares/auth'); 

router.post('/:collection',authMiddleware, createDocument);
router.get('/:collection/',authMiddleware,  readAllDocument);
router.get('/:collection/:id',authMiddleware, readDocument);
router.put('/:collection/:id',authMiddleware, updateDocument);
router.delete('/:collection/:id',authMiddleware, deleteDocument);
router.post('/graph/:collection',authMiddleware, graph);

module.exports = router;