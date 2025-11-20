# Printer POS API

Server middleware untuk mengirim data print ke printer POS menggunakan ESC/POS commands.

## Struktur Folder

```
printer_pos/
├── index.js                          # File utama server
├── printer-status.html               # Halaman web untuk status printer
├── printer-settings.json             # File konfigurasi (auto-generated)
├── printer-settings.example.json     # Contoh file konfigurasi
├── utils/
│   ├── settings.js                   # Module untuk manage settings
│   ├── printer.js                    # Module untuk komunikasi printer
│   └── escpos.js                     # Module untuk generate ESC/POS commands
├── package.json
└── README.md
```

## Instalasi

```bash
npm install
# atau
pnpm install
```

## Menjalankan Server

```bash
npm start
# atau untuk development dengan auto-reload
npm run dev
```

Server akan berjalan di `http://127.0.0.1:3000`

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

### Settings tidak tersimpan
- Pastikan aplikasi memiliki permission untuk write file
- Cek apakah file `printer-settings.json` ada dan readable

## License

ISC
