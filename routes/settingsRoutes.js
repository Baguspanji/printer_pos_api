const express = require('express');
const router = express.Router();
const { 
    getStoreSettings, 
    updateStoreSettings, 
    backupSettings, 
    restoreSettings 
} = require('../controllers/settingsController');

// GET /settings/store - Get store settings
router.get('/store', getStoreSettings);

// PUT /settings/store - Update store settings
router.put('/store', updateStoreSettings);

// GET /settings/backup - Backup settings to file
router.get('/backup', backupSettings);

// POST /settings/restore - Restore settings from backup
router.post('/restore', restoreSettings);

module.exports = router;
