# Struktur versi frontend terpisah

## File yang dibuka di browser

Buka `index.html` untuk menjalankan versi frontend yang sudah dipecah.

File lama `plus fitur import.html` tetap dibiarkan sebagai cadangan versi satu-file.

## Backend Google Apps Script

`code.gs` tetap terpisah dan tetap dipakai di Google Apps Script.

Alurnya:

1. Frontend memanggil URL Apps Script dari `js/config.js`.
2. Fungsi `gasAPI()` di `js/api.js` mengirim `action` dan `payload`.
3. `code.gs` menerima request lewat `doPost(e)`.
4. `code.gs` menyimpan atau membaca data dari Google Spreadsheet.

Jadi `code.gs` tidak perlu digabung ke HTML.

## Susunan frontend

- `index.html`: kerangka tampilan utama.
- `assets/brand`: tempat favicon dan logo lokal aplikasi.
- `css/app.css`: CSS custom dan aturan print.
- `js/config.js`: konfigurasi `IS_PREVIEW`, `GAS_URL`, dan tahun aktif.
- `js/state.js`: data awal dan state aplikasi.
- `js/api.js`: koneksi ke backend Apps Script.
- `js/ui.js`: loading, toast, confirm, dropdown.
- `js/print-export.js`: cetak PDF dan ekspor Excel.
- `js/forms-public.js`: form dinamis, captcha, filter publik, dropdown wilayah.
- `js/auth-users.js`: login, logout, profil, dan manajemen user.
- `js/render-public.js`: render tabel publik dan mode perbandingan.
- `js/render-admin.js`: render tabel admin poktan dan bantuan.
- `js/poktan-bantuan-crud.js`: tambah, edit, hapus poktan dan bantuan.
- `js/import-csv.js`: template dan import CSV.
- `js/dashboard-years.js`: dashboard, chart, dan pengaturan tahun.
- `js/main.js`: proses awal saat aplikasi dibuka.

## Catatan penting

Selama semua file dan folder ini tetap satu lokasi dengan `index.html`, aplikasi tetap bisa dibuka dengan dobel klik.

Untuk logo lokal, isi folder `assets/brand` dengan:

- `favicon.png`
- `logo-mark.png`
- `logo-login.png`

Detail ukuran dan catatan ada di `assets/brand/README.md`.

Jangan menghapus `plus fitur import.html` dulu sampai versi `index.html` sudah dicek nyaman di browser.
