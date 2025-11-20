# Printer POS API

Server middleware untuk mengirim data print ke printer POS menggunakan ESC/POS commands. Aplikasi ini menyediakan REST API untuk mencetak struk pembelian ke printer thermal POS.

## Fitur

- 🖨️ Print struk ke printer thermal POS
- 🔧 Konfigurasi printer via API atau Web Interface
- 📝 Pengaturan informasi toko (nama, alamat, footer)
- 💾 Auto-save settings ke file JSON
- 🌐 Web UI untuk monitoring dan konfigurasi
- 📦 Build executable untuk distribusi tanpa Node.js
- 🔄 Support CORS untuk integrasi frontend
- ✅ Health check endpoint
- 🪵 Logging sistem dengan rotating files

## Struktur Folder

```
printer_pos/
├── index.js                          # File utama server
├── package.json                      # Dependencies dan scripts
├── printer-settings.json             # File konfigurasi (auto-generated)
├── printer-settings.example.json     # Contoh file konfigurasi
├── example-purchase.json             # Contoh data pembelian
├── controllers/                      # Business logic controllers
│   ├── printController.js            # Handle print operations
│   ├── printerController.js          # Handle printer management
│   └── settingsController.js         # Handle settings operations
├── routes/                           # API route definitions
│   ├── printRoutes.js                # Print endpoints
│   ├── printerRoutes.js              # Printer endpoints
│   └── settingsRoutes.js             # Settings endpoints
├── utils/                            # Utility modules
│   ├── escpos.js                     # Generate ESC/POS commands
│   ├── logger.js                     # Logging utility
│   ├── printer.js                    # Printer communication
│   ├── settings.js                   # Settings management
│   └── validator.js                  # Input validation
├── views/                            # Frontend files
│   └── printer-status.html           # Web UI untuk status printer
└── logs/                             # Application logs (auto-generated)
```

## Instalasi

### Development Mode

```bash
# Install dependencies
npm install
# atau
pnpm install

# Jalankan server
npm start
# atau untuk development dengan auto-reload
npm run dev
```

Server akan berjalan di `http://127.0.0.1:3000`

### Production Mode (Executable)

Build executable untuk distribusi tanpa perlu install Node.js:

```bash
# Build untuk Windows (x64 dan ARM64)
npm run build-win

# Build untuk macOS (x64 dan ARM64)
npm run build-mac

# Build untuk Linux (x64)
npm run build-linux
```

Hasil build akan tersimpan di folder root dengan nama:
- `printer_pos-x64` (Intel/AMD)
- `printer_pos-arm64` (Apple Silicon/ARM)

Jalankan executable:
```bash
# macOS/Linux
./printer_pos-x64
# atau
./printer_pos-arm64

# Windows
printer_pos-x64.exe
```

## Konfigurasi

### Settings Disimpan Otomatis

Semua pengaturan (printer dan toko) disimpan secara otomatis ke file `printer-settings.json`. File ini akan dibuat otomatis saat pertama kali mengatur printer atau informasi toko.

### Default Settings

```json
{
  "printer_name": null,
  "store_name": "TOKO ANDA",
  "store_address": "Jalan Kenangan No. 123",
  "store_footer": "Terima kasih atas kunjungan Anda!"
}
```

## API Endpoints

### 1. Halaman Status Printer
```
GET /
```
Membuka halaman web untuk melihat status dan mengatur printer.

### 2. Print Receipt
```
POST /print
Content-Type: application/json

{
  "items": [
    {
      "name": "Produk A",
      "qty": 2,
      "price": 15000
    },
    {
      "name": "Produk B",
      "qty": 1,
      "price": 25000
    }
  ]
}
```

**Response Success:**
```json
{
  "status": "success",
  "message": "Job cetak berhasil dikirim ke NamaPrinter",
  "data": {
    "items_count": 2,
    "total": 55000
  }
}
```

### 3. Cek Status Printer
```
GET /printer/status
```

**Response:**
```json
{
  "status": "success",
  "platform": "darwin",
  "configured_printer": "POS_Printer",
  "printer_found": true,
  "is_configured": true,
  "available_printers": [
    {
      "name": "POS_Printer",
      "status": "available",
      "is_selected": true
    }
  ]
}
```

### 4. Set Printer
```
POST /printer/set
Content-Type: application/json

{
  "printer_name": "POS_Printer"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Printer berhasil diatur ke \"POS_Printer\"",
  "configured_printer": "POS_Printer"
}
```

### 5. Test Print
```
POST /printer/test
```

Mengirim test print ke printer untuk memverifikasi koneksi.

**Response:**
```json
{
  "status": "success",
  "message": "Test print berhasil dikirim ke printer",
  "printer": "POS_Printer"
}
```

### 6. Get Current Printer
```
GET /printer/current
```

**Response:**
```json
{
  "status": "success",
  "configured_printer": "POS_Printer",
  "is_configured": true
}
```

### 7. Get Store Settings
```
GET /settings/store
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "store_name": "TOKO ANDA",
    "store_address": "Jalan Kenangan No. 123",
    "store_footer": "Terima kasih atas kunjungan Anda!"
  }
}
```

### 8. Update Store Settings
```
PUT /settings/store
Content-Type: application/json

{
  "store_name": "Toko Saya",
  "store_address": "Jl. Contoh No. 456",
  "store_footer": "Selamat berbelanja kembali!"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Pengaturan toko berhasil diperbarui",
  "data": {
    "store_name": "Toko Saya",
    "store_address": "Jl. Contoh No. 456",
    "store_footer": "Selamat berbelanja kembali!"
  }
}
```

**Note:** Anda bisa mengirim hanya field yang ingin diupdate:
```json
{
  "store_name": "Toko Baru"
}
```

### 9. Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T10:30:00.000Z",
  "platform": "darwin",
  "printer_module": true,
  "configured_printer": "POS_Printer",
  "store_configured": true
}
```

## Error Response Format

```json
{
  "status": "error",
  "message": "Deskripsi error"
}
```

## Platform Support

- ✅ macOS (menggunakan `lpr`)
- ✅ Windows (menggunakan `print`)
- ✅ Linux (menggunakan `lpr`)

## Contoh Penggunaan dengan JavaScript

```javascript
// Print receipt
fetch('http://127.0.0.1:3000/print', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    items: [
      { name: 'Kopi', qty: 2, price: 15000 },
      { name: 'Roti', qty: 1, price: 10000 }
    ]
  })
})
.then(res => res.json())
.then(data => console.log(data));

// Update store settings
fetch('http://127.0.0.1:3000/settings/store', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    store_name: 'Warung Kopi Saya',
    store_address: 'Jl. Senopati No. 10',
    store_footer: 'Terima kasih, sampai jumpa lagi!'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## Troubleshooting

### Printer tidak ditemukan

- Pastikan printer sudah terinstall dan aktif di sistem
- Cek nama printer di sistem operasi Anda
- Gunakan endpoint `/printer/status` untuk melihat daftar printer tersedia

### Gagal mencetak

- Pastikan printer sudah dipilih menggunakan `/printer/set`
- Coba jalankan test print dengan `/printer/test`
- Periksa log server untuk detail error
- Cek file log di folder `logs/` untuk informasi lebih detail

### Settings tidak tersimpan

- Pastikan aplikasi memiliki permission untuk write file
- Cek apakah file `printer-settings.json` ada dan readable
- Verifikasi format JSON pada file settings

### Executable tidak berjalan

- Pastikan file memiliki execute permission (macOS/Linux): `chmod +x printer_pos-x64`
- Di macOS, jika ada peringatan security, buka System Preferences > Security & Privacy
- Di Windows, allow permission jika ada Windows Defender warning

## Development

### Project Structure

Aplikasi ini dibangun dengan arsitektur MVC (Model-View-Controller):

- **Controllers**: Berisi business logic untuk setiap fitur
- **Routes**: Definisi endpoint API dan routing
- **Utils**: Fungsi utility yang dapat digunakan kembali
- **Views**: Frontend HTML untuk web interface

### Logging

Log disimpan di folder `logs/` dengan format:
- `app.log`: Log aplikasi umum
- Log file di-rotate otomatis untuk mencegah file terlalu besar

### Adding New Features

1. Buat controller baru di folder `controllers/`
2. Definisikan routes di folder `routes/`
3. Register routes di `index.js`
4. Update dokumentasi API di README

## Technologies Used

- **Express.js**: Web framework
- **node-printer**: Native printer module untuk komunikasi dengan printer
- **CORS**: Enable cross-origin requests
- **pkg**: Package Node.js app menjadi executable

## Requirements

- Node.js 18 atau lebih tinggi (untuk development)
- Printer thermal POS yang support ESC/POS commands
- Port 3000 harus tersedia

## Contributing

1. Fork repository ini
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

ISC

## Author

Baguspanji

## Support

Untuk pertanyaan atau dukungan, silakan buka issue di repository GitHub.
