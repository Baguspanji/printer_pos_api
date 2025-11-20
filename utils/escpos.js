const os = require('os');

/**
 * Get paper width configuration
 */
function getPaperWidth(paperSize) {
    return paperSize === '58mm' ? 32 : 48; // 58mm = 32 chars, 80mm = 48 chars
}

/**
 * Get separator line based on paper size
 */
function getSeparator(paperSize) {
    const width = getPaperWidth(paperSize);
    return '='.repeat(width) + '\n';
}

/**
 * Get dash separator based on paper size
 */
function getDashSeparator(paperSize) {
    const width = getPaperWidth(paperSize);
    return '  ' + '-'.repeat(width - 2) + '\n';
}

/**
 * Generate ESC/POS buffer untuk struk
 */
function generateReceiptBuffer(receiptData, storeInfo) {
    let escpos_commands = [];
    let total_price = 0;
    const paperSize = storeInfo.paper_size || '80mm';
    const paperWidth = getPaperWidth(paperSize);

    // Inisialisasi Printer
    escpos_commands.push(Buffer.from('\x1B\x40'));
    
    // Header - Center Align
    escpos_commands.push(Buffer.from('\x1B\x61\x01'));
    escpos_commands.push(Buffer.from(storeInfo.store_name + '\n', 'utf8'));
    escpos_commands.push(Buffer.from(storeInfo.store_address + '\n', 'utf8'));
    
    // Nomor telepon jika ada
    if (storeInfo.store_phone) {
        escpos_commands.push(Buffer.from(storeInfo.store_phone + '\n', 'utf8'));
    }
    
    // Separator header
    escpos_commands.push(Buffer.from(getSeparator(paperSize), 'utf8'));
    
    // Transaksi Info - Left Align
    escpos_commands.push(Buffer.from('\x1B\x61\x00'));
    
    // TRX ID dan Kasir (justify-between)
    const trxId = receiptData.trx_id || 'TRX' + Date.now().toString(36).toUpperCase();
    const trxText = `TRX ${trxId}`;
    
    if (receiptData.cashier) {
        const cashierText = `Kasir: ${receiptData.cashier}`;
        const spaces = Math.max(1, paperWidth - trxText.length - cashierText.length);
        escpos_commands.push(Buffer.from(`${trxText}${' '.repeat(spaces)}${cashierText}\n`, 'utf8'));
    } else {
        escpos_commands.push(Buffer.from(`${trxText}\n`, 'utf8'));
    }
    
    escpos_commands.push(Buffer.from(getDashSeparator(paperSize), 'utf8'));

    // Detail Items
    receiptData.items.forEach(item => {
        // Validasi item
        if (!item.name || !item.qty || !item.price) {
            console.warn('Item tidak valid, dilewati:', item);
            return;
        }

        const linePrice = item.qty * item.price;
        total_price += linePrice;

        // Format: NAMA ITEM qty x harga [spaces] subtotal
        const itemName = String(item.name).toUpperCase();
        const unitPrice = item.price.toLocaleString('id-ID');
        const subtotal = linePrice.toLocaleString('id-ID');
        
        const leftPart = `${itemName} ${item.qty}x${unitPrice}`;
        const spaces = Math.max(1, paperWidth - leftPart.length - subtotal.length);
        
        escpos_commands.push(Buffer.from(`${leftPart}${' '.repeat(spaces)}${subtotal}\n`, 'utf8'));
    });
    
    escpos_commands.push(Buffer.from(getDashSeparator(paperSize), 'utf8'));

    // Total Items dan Total Belanja
    const totalItems = receiptData.items.reduce((sum, item) => sum + item.qty, 0);
    const itemSpaces = Math.max(1, paperWidth - 10 - totalItems.toString().length);
    escpos_commands.push(Buffer.from(`Total Item${' '.repeat(itemSpaces)}${totalItems}\n`, 'utf8'));
    
    // Total Belanja (Right Align)
    escpos_commands.push(Buffer.from('Total Belanja', 'utf8'));
    const totalStr = total_price.toLocaleString('id-ID');
    const totalSpaces = Math.max(1, paperWidth - 13 - totalStr.length);
    escpos_commands.push(Buffer.from(' '.repeat(totalSpaces) + totalStr + '\n', 'utf8'));
    
    // Kembali (jika ada)
    const payment_amount = receiptData.payment_amount || 0;
    const change = payment_amount - total_price;
    if (payment_amount > 0) {
        escpos_commands.push(Buffer.from('Kembali', 'utf8'));
        const changeStr = change.toLocaleString('id-ID');
        const changeSpaces = Math.max(1, paperWidth - 7 - changeStr.length);
        escpos_commands.push(Buffer.from(' '.repeat(changeSpaces) + changeStr + '\n', 'utf8'));
    }
    
    escpos_commands.push(Buffer.from(getDashSeparator(paperSize), 'utf8'));

    // Tanggal dan Waktu - Center align
    escpos_commands.push(Buffer.from('\x1B\x61\x01'));
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    escpos_commands.push(Buffer.from(`     Tgl ${dateStr}, ${timeStr}\n`, 'utf8'));
    
    // Separator footer
    escpos_commands.push(Buffer.from(getSeparator(paperSize) + '\n', 'utf8'));

    // Footer message
    escpos_commands.push(Buffer.from(storeInfo.store_footer + '\n', 'utf8'));
    
    // Info tambahan (jika ada)
    if (receiptData.notes) {
        escpos_commands.push(Buffer.from(receiptData.notes + '\n', 'utf8'));
    }
    
    // Sales order info (jika ada)
    if (receiptData.created_at) {
        const createdDate = new Date(receiptData.created_at);
        const createdStr = createdDate.toLocaleString('en-US', { 
            month: '2-digit', 
            day: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        escpos_commands.push(Buffer.from(`Sales order created on ${createdStr}\n`, 'utf8'));
    }
    
    escpos_commands.push(Buffer.from('\n\n', 'utf8'));

    // Pemotongan Kertas (Cut)
    escpos_commands.push(Buffer.from('\x1D\x56\x00', 'binary'));

    return {
        buffer: Buffer.concat(escpos_commands),
        total: total_price
    };
}

/**
 * Generate ESC/POS buffer untuk test print
 */
function generateTestPrintBuffer(storeInfo, printerName) {
    let escpos_commands = [];
    const paperSize = storeInfo.paper_size || '80mm';
    const paperWidth = getPaperWidth(paperSize);
    
    // Inisialisasi dan Rata Tengah
    escpos_commands.push(Buffer.from('\x1B\x40')); // Init printer
    escpos_commands.push(Buffer.from('\x1B\x61\x01')); // Center align
    
    // Header
    escpos_commands.push(Buffer.from(getSeparator(paperSize), 'utf8'));
    escpos_commands.push(Buffer.from('   TEST PRINT PRINTER POS\n', 'utf8'));
    escpos_commands.push(Buffer.from(getSeparator(paperSize) + '\n', 'utf8'));
    
    // Info
    escpos_commands.push(Buffer.from('\x1B\x61\x00')); // Left align
    escpos_commands.push(Buffer.from(`Toko: ${storeInfo.store_name}\n`, 'utf8'));
    escpos_commands.push(Buffer.from(`Alamat: ${storeInfo.store_address}\n`, 'utf8'));
    escpos_commands.push(Buffer.from(`Printer: ${printerName}\n`, 'utf8'));
    escpos_commands.push(Buffer.from(`Paper Size: ${paperSize}\n`, 'utf8'));
    escpos_commands.push(Buffer.from(`Platform: ${os.platform()}\n`, 'utf8'));
    escpos_commands.push(Buffer.from(`Waktu: ${new Date().toLocaleString('id-ID')}\n\n`, 'utf8'));
    
    escpos_commands.push(Buffer.from('Status:\n', 'utf8'));
    escpos_commands.push(Buffer.from('✓ Koneksi berhasil\n', 'utf8'));
    escpos_commands.push(Buffer.from('✓ Printer siap digunakan\n', 'utf8'));
    escpos_commands.push(Buffer.from('✓ Test print berhasil\n\n', 'utf8'));
    
    escpos_commands.push(Buffer.from(getDashSeparator(paperSize), 'utf8'));
    escpos_commands.push(Buffer.from('\x1B\x61\x01')); // Center align
    escpos_commands.push(Buffer.from(storeInfo.store_footer + '\n\n\n', 'utf8'));
    
    // Cut paper
    escpos_commands.push(Buffer.from('\x1D\x56\x00', 'binary'));
    
    return Buffer.concat(escpos_commands);
}

module.exports = {
    generateReceiptBuffer,
    generateTestPrintBuffer
};
