const express = require('express');
const cors = require('cors');
const os = require('os');
const path = require('path');

// Import utility modules
const { loadSettings, getSettings } = require('./utils/settings');
const { getAvailablePrinters, printerAvailable } = require('./utils/printer');
const logger = require('./utils/logger');

// Import routes
const printRoutes = require('./routes/printRoutes');
const printerRoutes = require('./routes/printerRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// --- KONFIGURASI ---
const SERVER_PORT = 3000;

const app = express();

// Middleware CORS yang lebih permisif untuk development
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false,
    optionsSuccessStatus: 200,
    preflightContinue: false
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    logger.apiRequest(req.method, req.path, req.headers.origin);
    next();
});

// Load settings saat startup
loadSettings();

// --- ROUTES ---
app.use('/print', printRoutes);
app.use('/printer', printerRoutes);
app.use('/settings', settingsRoutes);

// --- ENDPOINT UNTUK SERVE HALAMAN STATUS PRINTER ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/printer-status.html'));
});

// --- ENDPOINT HEALTH CHECK ---
app.get('/health', (req, res) => {
    const settings = getSettings();
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        platform: os.platform(),
        printer_module: printerAvailable,
        configured_printer: settings.printer_name,
        store_configured: !!(settings.store_name && settings.store_address)
    });
});

// --- ERROR HANDLER ---
app.use((err, req, res, next) => {
    logger.error('Unhandled error', { error: err.message, stack: err.stack });
    res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
});

// --- JALANKAN SERVER ---
app.listen(SERVER_PORT, () => {
    const settings = getSettings();
    
    console.log('\n========================================');
    console.log('  Node.js Printer Middleware');
    console.log('========================================');
    console.log(`✓ Server berjalan di http://127.0.0.1:${SERVER_PORT}`);
    console.log(`✓ Printer target: ${settings.printer_name || 'Belum diatur'}`);
    console.log(`✓ Paper size: ${settings.paper_size || '80mm'}`);
    console.log('\nEndpoints:');
    console.log(`  GET  http://127.0.0.1:${SERVER_PORT}/ (Status Page)`);
    console.log(`  POST http://127.0.0.1:${SERVER_PORT}/print`);
    console.log(`  GET  http://127.0.0.1:${SERVER_PORT}/printer/status`);
    console.log(`  POST http://127.0.0.1:${SERVER_PORT}/printer/set`);
    console.log(`  POST http://127.0.0.1:${SERVER_PORT}/printer/test`);
    console.log(`  GET  http://127.0.0.1:${SERVER_PORT}/printer/current`);
    console.log(`  GET  http://127.0.0.1:${SERVER_PORT}/settings/store`);
    console.log(`  PUT  http://127.0.0.1:${SERVER_PORT}/settings/store`);
    console.log(`  GET  http://127.0.0.1:${SERVER_PORT}/settings/backup`);
    console.log(`  POST http://127.0.0.1:${SERVER_PORT}/settings/restore`);
    console.log(`  GET  http://127.0.0.1:${SERVER_PORT}/health`);
    console.log('========================================\n');

    // Cek status printer saat startup
    try {
        const printers = getAvailablePrinters();
        console.log(`Ditemukan ${printers.length} printer di sistem (${os.platform()}):`);
        printers.forEach(name => console.log(`  - ${name}`));

        if (settings.printer_name) {
            const printerExists = printers.includes(settings.printer_name);
            if (printerExists) {
                console.log(`\n✓ Printer "${settings.printer_name}" siap digunakan`);
            } else {
                console.log(`\n⚠ WARNING: Printer "${settings.printer_name}" tidak ditemukan!`);
                if (printers.length > 0) {
                    console.log(`   Gunakan salah satu dari: ${printers.join(', ')}`);
                }
            }
        } else {
            console.log(`\n⚠ Printer belum diatur. Silakan pilih printer di halaman status.`);
            if (printers.length > 0) {
                console.log(`   Printer yang tersedia: ${printers.join(', ')}`);
            }
        }
        
        // Info store settings
        console.log(`\nPengaturan Toko:`);
        console.log(`  Nama: ${settings.store_name}`);
        console.log(`  Alamat: ${settings.store_address}`);
        console.log(`  Footer: ${settings.store_footer}`);
        console.log(`  Paper Size: ${settings.paper_size || '80mm'}`);
    } catch (error) {
        console.error('✗ Error saat mengecek printer:', error.message);
    }
    console.log('');
});
