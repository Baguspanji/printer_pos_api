/**
 * Validasi data untuk printing receipt
 */
function validateReceiptData(data) {
    const errors = [];

    // Validasi items
    if (!data || typeof data !== 'object') {
        errors.push('Data harus berupa object');
        return { valid: false, errors };
    }

    if (!data.items) {
        errors.push('Field "items" harus ada');
    } else if (!Array.isArray(data.items)) {
        errors.push('Field "items" harus berupa array');
    } else if (data.items.length === 0) {
        errors.push('Items tidak boleh kosong');
    } else {
        // Validasi setiap item
        data.items.forEach((item, index) => {
            if (!item.name || typeof item.name !== 'string' || item.name.trim().length === 0) {
                errors.push(`Item ${index + 1}: nama produk harus diisi (string)`);
            }
            if (item.name && item.name.length > 50) {
                errors.push(`Item ${index + 1}: nama produk terlalu panjang (max 50 karakter)`);
            }
            if (item.qty === undefined || item.qty === null || typeof item.qty !== 'number' || item.qty <= 0) {
                errors.push(`Item ${index + 1}: qty harus angka positif`);
            }
            if (item.price === undefined || item.price === null || typeof item.price !== 'number' || item.price < 0) {
                errors.push(`Item ${index + 1}: price harus angka non-negatif`);
            }
        });
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validasi data untuk store settings
 */
function validateStoreSettings(data) {
    const errors = [];

    if (!data || typeof data !== 'object') {
        errors.push('Data harus berupa object');
        return { valid: false, errors };
    }

    // Validasi store_name
    if (data.store_name !== undefined) {
        if (typeof data.store_name !== 'string') {
            errors.push('store_name harus berupa string');
        } else if (data.store_name.trim().length === 0) {
            errors.push('store_name tidak boleh kosong');
        } else if (data.store_name.length > 100) {
            errors.push('store_name terlalu panjang (max 100 karakter)');
        }
    }

    // Validasi store_address
    if (data.store_address !== undefined) {
        if (typeof data.store_address !== 'string') {
            errors.push('store_address harus berupa string');
        } else if (data.store_address.trim().length === 0) {
            errors.push('store_address tidak boleh kosong');
        } else if (data.store_address.length > 200) {
            errors.push('store_address terlalu panjang (max 200 karakter)');
        }
    }

    // Validasi store_phone
    if (data.store_phone !== undefined) {
        if (typeof data.store_phone !== 'string') {
            errors.push('store_phone harus berupa string');
        } else if (data.store_phone.length > 20) {
            errors.push('store_phone terlalu panjang (max 20 karakter)');
        }
    }

    // Validasi store_footer
    if (data.store_footer !== undefined) {
        if (typeof data.store_footer !== 'string') {
            errors.push('store_footer harus berupa string');
        } else if (data.store_footer.length > 200) {
            errors.push('store_footer terlalu panjang (max 200 karakter)');
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validasi printer name
 */
function validatePrinterName(printerName) {
    const errors = [];

    if (!printerName) {
        errors.push('printer_name harus diisi');
    } else if (typeof printerName !== 'string') {
        errors.push('printer_name harus berupa string');
    } else if (printerName.trim().length === 0) {
        errors.push('printer_name tidak boleh kosong');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

module.exports = {
    validateReceiptData,
    validateStoreSettings,
    validatePrinterName
};
