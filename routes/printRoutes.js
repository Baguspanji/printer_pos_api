const express = require('express');
const router = express.Router();
const { printReceipt } = require('../controllers/printController');

// POST /print - Print receipt
router.post('/', printReceipt);

module.exports = router;
