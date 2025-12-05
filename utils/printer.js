const { execSync, exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

let printer;
let printerAvailable = false;

// Coba load winrawprinter untuk Windows, dengan fallback untuk platform lain
try {
    const platform = os.platform();
    if (platform === 'win32') {
        printer = require('winrawprinter');
        printerAvailable = true;
        console.log('✓ Module winrawprinter berhasil dimuat');
    } else {
        console.log('✓ Menggunakan system commands untuk printer (non-Windows)');
    }
} catch (error) {
    console.error('✗ Error loading winrawprinter:', error.message);
    console.log('Akan menggunakan metode alternatif untuk print');
}

/**
 * Mendapatkan daftar printer yang tersedia
 */
function getAvailablePrinters() {
    if (printerAvailable && printer && printer.getPrinters) {
        try {
            const printers = printer.getPrinters();
            return Array.isArray(printers) ? printers.map(p => p.name || p) : [];
        } catch (error) {
            console.error('Error getting printer list from winrawprinter:', error.message);
        }
    }
    
    // Fallback: gunakan system command
    try {
        const platform = os.platform();
        if (platform === 'darwin') {
            // macOS
            const output = execSync('lpstat -p | grep "printer" | awk \'{print $2}\'', { encoding: 'utf8' });
            return output.trim().split('\n').filter(p => p);
        } else if (platform === 'win32') {
            // Windows fallback
            const output = execSync('wmic printer get name', { encoding: 'utf8' });
            return output.split('\n').slice(1).map(p => p.trim()).filter(p => p);
        } else if (platform === 'linux') {
            // Linux
            const output = execSync('lpstat -p | grep "printer" | awk \'{print $2}\'', { encoding: 'utf8' });
            return output.trim().split('\n').filter(p => p);
        }
    } catch (error) {
        console.error('Error getting system printers:', error.message);
    }
    
    return [];
}

/**
 * Mengirimkan perintah ESC/POS (dalam bentuk buffer) ke printer
 * @param {Buffer} buffer - Data biner ESC/POS yang akan dicetak
 * @param {string} printerName - Nama printer target
 */
function printRawData(buffer, printerName) {
    return new Promise((resolve, reject) => {
        const platform = os.platform();
        
        // Cek apakah printer tersedia
        const availablePrinters = getAvailablePrinters();
        
        if (!availablePrinters || availablePrinters.length === 0) {
            return reject(new Error('Tidak ada printer yang tersedia di sistem'));
        }

        // Cek apakah printer target ada
        const printerExists = availablePrinters.includes(printerName);
        if (!printerExists) {
            return reject(new Error(
                `Printer "${printerName}" tidak ditemukan.\n` +
                `Printer yang tersedia: ${availablePrinters.join(', ')}`
            ));
        }

        if (platform === 'win32' && printerAvailable && printer) {
            // Gunakan winrawprinter untuk Windows
            try {
                printer.write(buffer, printerName, (err) => {
                    if (err) {
                        console.error("✗ Error saat mencetak dengan winrawprinter:", err.message);
                        reject(new Error(`Gagal mengirim job cetak: ${err.message}`));
                    } else {
                        console.log(`✓ Print job berhasil dikirim ke ${printerName} via winrawprinter`);
                        resolve(`Job cetak berhasil dikirim ke ${printerName}`);
                    }
                });
            } catch (error) {
                console.error("✗ Error pada proses print dengan winrawprinter:", error);
                reject(new Error(`Gagal memproses print job: ${error.message}`));
            }
        } else {
            // Fallback: gunakan system command
            const tempFile = path.join(os.tmpdir(), `print_${Date.now()}.bin`);
            
            try {
                // Tulis buffer ke temporary file
                fs.writeFileSync(tempFile, buffer);
                
                let printCommand;
                if (platform === 'darwin' || platform === 'linux') {
                    // macOS dan Linux menggunakan lpr
                    printCommand = `lpr -P "${printerName}" -o raw "${tempFile}"`;
                } else if (platform === 'win32') {
                    // Windows menggunakan print command atau copy
                    printCommand = `type "${tempFile}" | print /D:"${printerName}"`;
                } else {
                    fs.unlinkSync(tempFile);
                    return reject(new Error(`Platform ${platform} tidak didukung`));
                }
                
                // Execute print command
                exec(printCommand, (error, stdout, stderr) => {
                    // Hapus temporary file
                    try {
                        fs.unlinkSync(tempFile);
                    } catch (e) {
                        console.warn('Tidak bisa menghapus temporary file:', e.message);
                    }
                    
                    if (error) {
                        console.error("✗ Error saat mencetak:", error.message);
                        reject(new Error(`Gagal mengirim job cetak: ${error.message}`));
                    } else {
                        console.log(`✓ Print job berhasil dikirim ke ${printerName}`);
                        resolve(`Job cetak berhasil dikirim ke ${printerName}`);
                    }
                });
                
            } catch (error) {
                // Hapus temporary file jika ada error
                try {
                    if (fs.existsSync(tempFile)) {
                        fs.unlinkSync(tempFile);
                    }
                } catch (e) {}
                
                console.error("✗ Error pada proses print:", error);
                reject(new Error(`Gagal memproses print job: ${error.message}`));
            }
        }
    });
}

module.exports = {
    getAvailablePrinters,
    printRawData,
    printerAvailable
};
