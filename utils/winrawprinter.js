// Windows Raw Printer Module Wrapper
const os = require('os');

let winrawprinter = null;

// Only load on Windows
if (os.platform() === 'win32') {
    try {
        winrawprinter = require('../build/Release/winrawprinter');
    } catch (e) {
        console.warn('Native winrawprinter module not loaded. Make sure to run: npm run build-native');
        console.warn('Error:', e.message);
    }
}

/**
 * Send raw data to a specific printer
 * @param {string} printerName - The name of the printer
 * @param {string|Buffer} data - The data to send
 * @returns {number} Number of bytes written
 */
function sendToPrinter(printerName, data) {
    if (!winrawprinter) {
        throw new Error('winrawprinter module not available. Running on Windows only.');
    }

    // Convert Buffer to string if needed
    const dataString = Buffer.isBuffer(data) ? data.toString('binary') : data;
    return winrawprinter.sendToPrinter(printerName, dataString);
}

/**
 * Get list of available printers
 * @returns {Array<string>} Array of printer names
 */
function getPrinters() {
    if (!winrawprinter) {
        console.warn('winrawprinter module not available. Running on Windows only.');
        return [];
    }

    return winrawprinter.getPrinters();
}

module.exports = {
    sendToPrinter,
    getPrinters,
    isAvailable: () => winrawprinter !== null
};
