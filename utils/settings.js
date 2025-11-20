const fs = require('fs');
const path = require('path');
const os = require('os');

// Gunakan direktori yang writable untuk packaged app
let SETTINGS_FILE;
if (process.pkg) {
    // Packaged app - gunakan user home directory
    const configDir = path.join(os.homedir(), '.printer_pos');
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
    SETTINGS_FILE = path.join(configDir, 'printer-settings.json');
} else {
    // Development mode
    SETTINGS_FILE = path.join(__dirname, '..', 'printer-settings.json');
}

// Default settings
let settings = {
    printer_name: null,
    store_name: 'TOKO ANDA',
    store_address: 'Jalan Kenangan No. 123',
    store_phone: '08123456789',
    store_footer: 'Terima kasih atas kunjungan Anda!',
    paper_size: '80mm' // Options: '80mm' or '58mm'
};

/**
 * Load settings dari file JSON
 */
function loadSettings() {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
            settings = { ...settings, ...JSON.parse(data) };
            console.log('✓ Settings berhasil dimuat dari file');
        } else {
            console.log('⚠ File settings tidak ditemukan, menggunakan default');
        }
    } catch (error) {
        console.error('✗ Error loading settings:', error.message);
    }
    return settings;
}

/**
 * Save settings ke file JSON
 */
function saveSettings() {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
        console.log('✓ Settings berhasil disimpan');
        return true;
    } catch (error) {
        console.error('✗ Error saving settings:', error.message);
        return false;
    }
}

/**
 * Get current settings
 */
function getSettings() {
    return settings;
}

/**
 * Update settings
 */
function updateSettings(newSettings) {
    settings = { ...settings, ...newSettings };
    return saveSettings();
}

module.exports = {
    loadSettings,
    saveSettings,
    getSettings,
    updateSettings
};
