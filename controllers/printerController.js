const os = require('os');
const { getSettings, updateSettings } = require('../utils/settings');
const { getAvailablePrinters, printRawData } = require('../utils/printer');
const { generateTestPrintBuffer } = require('../utils/escpos');
const { validatePrinterName } = require('../utils/validator');
const logger = require('../utils/logger');

/**
 * Get printer status
 */
function getPrinterStatus(req, res) {
    try {
        const settings = getSettings();
        const printers = getAvailablePrinters();
        const printerExists = settings.printer_name ? printers.includes(settings.printer_name) : false;

        res.json({
            status: 'success',
            platform: os.platform(),
            configured_printer: settings.printer_name,
            printer_found: printerExists,
            is_configured: settings.printer_name !== null,
            available_printers: printers.map(name => ({
                name: name,
                status: 'available',
                is_selected: name === settings.printer_name
            }))
        });
    } catch (error) {
        console.error('✗ Error checking printer status:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}

/**
 * Set printer
 */
function setPrinter(req, res) {
    try {
        const { printer_name } = req.body;
        
        // Validasi printer name
        const validation = validatePrinterName(printer_name);
        if (!validation.valid) {
            logger.warn('Set printer gagal: validasi error', { errors: validation.errors });
            return res.status(400).json({
                status: 'error',
                message: 'Data tidak valid',
                errors: validation.errors
            });
        }
        
        // Cek apakah printer tersedia
        const printers = getAvailablePrinters();
        if (!printers.includes(printer_name)) {
            logger.warn(`Printer "${printer_name}" tidak ditemukan`);
            return res.status(404).json({
                status: 'error',
                message: `Printer "${printer_name}" tidak ditemukan`,
                available_printers: printers
            });
        }
        
        // Set printer dan simpan ke file
        if (updateSettings({ printer_name })) {
            logger.success(`Printer diatur ke: ${printer_name}`);
            
            res.json({
                status: 'success',
                message: `Printer berhasil diatur ke "${printer_name}"`,
                configured_printer: printer_name
            });
        } else {
            throw new Error('Gagal menyimpan pengaturan printer');
        }
    } catch (error) {
        console.error('✗ Error setting printer:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}

/**
 * Get current printer
 */
function getCurrentPrinter(req, res) {
    const settings = getSettings();
    res.json({
        status: 'success',
        configured_printer: settings.printer_name,
        is_configured: settings.printer_name !== null
    });
}

/**
 * Test printer
 */
async function testPrinter(req, res) {
    try {
        const settings = getSettings();
        
        // Validasi printer sudah di-set
        if (!settings.printer_name) {
            return res.status(400).json({
                status: 'error',
                message: 'Printer belum diatur. Silakan pilih printer terlebih dahulu.'
            });
        }

        // Cek apakah printer tersedia
        const printers = getAvailablePrinters();
        if (!printers.includes(settings.printer_name)) {
            return res.status(404).json({
                status: 'error',
                message: `Printer "${settings.printer_name}" tidak ditemukan`,
                available_printers: printers
            });
        }

        // Generate test print buffer
        const finalBuffer = generateTestPrintBuffer({
            store_name: settings.store_name,
            store_address: settings.store_address,
            store_footer: settings.store_footer,
            paper_size: settings.paper_size
        }, settings.printer_name);
        
        // Kirim ke printer
        const result = await printRawData(finalBuffer, settings.printer_name);
        
        res.json({
            status: 'success',
            message: 'Test print berhasil dikirim ke printer',
            printer: settings.printer_name
        });
        
    } catch (error) {
        console.error('✗ Error test printer:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}

module.exports = {
    getPrinterStatus,
    setPrinter,
    getCurrentPrinter,
    testPrinter
};
