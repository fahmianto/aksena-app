# Aksena Smart Liquidation (ASL)
**Status:** Draft / Active Development  
**Feature Concept:** "Rescue My Money" - Automated Dead Stock Clearance 

## 1. Kriteria Deteksi "Stok Mati" (The Detection Engine)
Aksena secara otomatis memantau pergerakan barang (Inventory Turnover). Klien bisa mengatur parameter "Masa Tunggu", misalnya:
- **Zona Hijau:** Terjual dalam < 30 hari (Stok Lancar).
- **Zona Kuning:** Belum ada transaksi dalam 31-60 hari (Stok Lambat).
- **Zona Merah (Dead Stock):** Tidak ada penjualan sama sekali > 60 hari.

## 2. Alur Eksekusi Otomatis (The Action Flow)
Begitu barang masuk Zona Merah, Aksena tidak hanya diam, tapi melakukan aksi berikut:
**A. Notifikasi Strategis ke Owner**  
"Bos, Aksena mendeteksi ada 15 unit Gamis Katun Hijau yang sudah 65 hari tidak bergerak di gudang. Modal yang tertahan sekitar Rp 2.250.000. Mau Aksena bantu buatkan kampanye likuidasi hari ini?"

**B. Jalur "Smart Offer" (Cross-selling)**  
Saat ada pelanggan chat mencari produk lain, Aksena akan menyisipkan barang mati ini sebagai pemanis menggunakan AI (Prompt Engineering diinjeksi tag `SLOW_MOVING`).

**C. Otomasi Kampanye WA (Blast Segmented)**  
Aksena menyaring database pelanggan yang pernah beli kategori serupa, lalu mengirim pesan personal khusus promo cuci gudang 24 jam.

## 3. Dashboard Likuidasi (The Visibility)
Di Dashboard Merchant, akan ada tab khusus bernama **"Rescue My Money"**:
- **Potential Loss:** Estimasi uang yang tertahan di stok mati.
- **Projected Recovery:** Estimasi uang yang bisa kembali jika diskon diterapkan.
- **Auto-Discount Toggle:** Tombol sekali klik untuk mengizinkan Aksena memberikan diskon otomatis (misal: 10%, 20%, 50%) pada produk lambat.

## 4. Teknis Backend (Google Antigravity Architecture)
- **Daily Scan:** Setiap jam `00:00` (Cron Job/Firebase Functions), sistem menghitung `last_sold_date` tiap produk.
- **Tagging:** Produk yang kriteria merah diberikan tag `SLOW_MOVING`.
- **Prompt Engineering:** AI diberikan instruksi khusus prioritasi produk `SLOW_MOVING` sebagai saran substitusi atau bundling.

## 5. Value Proposition 
- **Bukan Cuma Notifikasi:** Aksena bukan memberitahu "Stok Habis", melainkan "Stok Kebanyakan, Sini Dibantu Jualin".
- **Menyelamatkan Cash Flow:** Mencegah kebangkrutan karena modal mati di gudang.
- **Otomasi Total:** Owner bebas dari urusan copywriting promo; Aksena yang handle dari draf, harga, dan penawaran ke leads/pelanggan.
