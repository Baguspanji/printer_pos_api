const { getSettings } = require('../utils/settings');
const { generateReceiptBuffer } = require('../utils/escpos');
const { printRawData } = require('../utils/printer');
const { validateReceiptData } = require('../utils/validator');
const logger = require('../utils/logger');

/**
 * Print receipt handler
 */
async function printReceipt(req, res) {
    const settings = getSettings();
    
    // Validasi printer sudah di-set
    if (!settings.printer_name) {
        logger.warn('Print request gagal: printer belum diatur');
        return res.status(400).json({
            status: 'error',
            message: 'Printer belum diatur. Silakan pilih printer terlebih dahulu.'
        });
    }

    const receiptData = req.body;

    // Validasi data dengan validator
    const validation = validateReceiptData(receiptData);
    if (!validation.valid) {
        logger.warn('Print request gagal: validasi error', { errors: validation.errors });
        return res.status(400).json({
            status: 'error',
            message: 'Data tidak valid',
            errors: validation.errors
        });
    }

    try {
        // Generate receipt buffer
        const { buffer: finalBuffer, total: total_price } = generateReceiptBuffer(receiptData, {
            store_name: settings.store_name,
            store_address: settings.store_address,
            store_phone: settings.store_phone,
            store_footer: settings.store_footer,
            paper_size: settings.paper_size
        });

        // Kirim job cetak
        const result = await printRawData(finalBuffer, settings.printer_name);

        // Log print job
        logger.printJob(settings.printer_name, receiptData.items.length, total_price);

        res.json({
            status: 'success',
            message: result,
            data: {
                items_count: receiptData.items.length,
                total: total_price
            }
        });

    } catch (error) {
        logger.error("Kesalahan dalam endpoint /print", { error: error.message });
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}

module.exports = {
    printReceipt
};
