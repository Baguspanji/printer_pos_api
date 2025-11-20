const express = require('express');
const router = express.Router();
const { 
    getPrinterStatus, 
    setPrinter, 
    getCurrentPrinter, 
    testPrinter 
} = require('../controllers/printerController');

// GET /printer/status - Get printer status and available printers
router.get('/status', getPrinterStatus);

// POST /printer/set - Set active printer
router.post('/set', setPrinter);

// GET /printer/current - Get current configured printer
router.get('/current', getCurrentPrinter);

// POST /printer/test - Test print
router.post('/test', testPrinter);

module.exports = router;
