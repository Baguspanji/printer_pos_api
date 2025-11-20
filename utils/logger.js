const fs = require('fs');
const path = require('path');
const os = require('os');

// Gunakan direktori yang writable untuk packaged app
// Jika running dari snapshot (pkg), gunakan temp/home directory
// Jika development mode, gunakan logs folder di project
let LOG_DIR;
if (process.pkg) {
    // Packaged app - gunakan user home directory
    LOG_DIR = path.join(os.homedir(), '.printer_pos', 'logs');
} else {
    // Development mode
    LOG_DIR = path.join(__dirname, '..', 'logs');
}

const LOG_FILE = path.join(LOG_DIR, `printer-${new Date().toISOString().split('T')[0]}.log`);

// Buat direktori logs jika belum ada
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Level logging
 */
const LogLevel = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS'
};

/**
 * Format log message
 */
function formatLogMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logData = data ? ` | Data: ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level}] ${message}${logData}\n`;
}

/**
 * Write log ke file
 */
function writeLog(level, message, data = null) {
    try {
        const logMessage = formatLogMessage(level, message, data);
        fs.appendFileSync(LOG_FILE, logMessage, 'utf8');
    } catch (error) {
        console.error('Failed to write log:', error.message);
    }
}

/**
 * Log functions
 */
const logger = {
    info: (message, data = null) => {
        console.log(`ℹ️  ${message}`);
        writeLog(LogLevel.INFO, message, data);
    },

    warn: (message, data = null) => {
        console.warn(`⚠️  ${message}`);
        writeLog(LogLevel.WARN, message, data);
    },

    error: (message, data = null) => {
        console.error(`❌ ${message}`);
        writeLog(LogLevel.ERROR, message, data);
    },

    success: (message, data = null) => {
        console.log(`✅ ${message}`);
        writeLog(LogLevel.SUCCESS, message, data);
    },

    // Log print activity
    printJob: (printerName, itemCount, total) => {
        const message = `Print job dikirim ke ${printerName}`;
        const data = { printer: printerName, items: itemCount, total };
        writeLog(LogLevel.SUCCESS, message, data);
    },

    // Log API request
    apiRequest: (method, path, origin = 'N/A') => {
        const message = `${method} ${path}`;
        const data = { origin };
        writeLog(LogLevel.INFO, message, data);
    }
};

/**
 * Clean up old logs (hapus log lebih dari 7 hari)
 */
function cleanupOldLogs() {
    try {
        const files = fs.readdirSync(LOG_DIR);
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 hari

        files.forEach(file => {
            const filePath = path.join(LOG_DIR, file);
            const stats = fs.statSync(filePath);
            const age = now - stats.mtimeMs;

            if (age > maxAge) {
                fs.unlinkSync(filePath);
                console.log(`🗑️  Deleted old log: ${file}`);
            }
        });
    } catch (error) {
        console.error('Failed to cleanup old logs:', error.message);
    }
}

// Cleanup old logs saat startup
cleanupOldLogs();

module.exports = logger;
