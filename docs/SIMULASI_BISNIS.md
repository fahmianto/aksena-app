# Simulasi Bisnis & Proyeksi Finansial Aksena

Dokumen ini berisi perhitungan biaya operasional (*Operational Cost*), skema penetapan harga (*Pricing Plan*), dan simulasi potensi pendapatan klien (*ROI Simulation*) untuk mempermudah proses penawaran (Pitching) B2B Aksena.

---

## 1. Proyeksi Biaya Operasional (Operational Cost)

Berikut adalah perkiraan biaya infrastruktur dan API (1 USD ≈ Rp 15.000) berdasarkan 3 Fase Pertumbuhan:

### FASE 1: Validasi Awal (< 500 Sesi Chat / Bulan)
*Asumsi: Aksena baru dipakai oleh 1-3 Klien awal untuk testing pasar.*
*   **Firebase (App/DB):** Rp 0 (Gratis)
*   **Server Backend:** Rp 0 - Rp 75.000 ($5/bln di Railway/Render)
*   **AI (Gemini/GPT):** Rp 0 - Rp 15.000
*   **WhatsApp Meta:** Rp 0 (Masuk kuota gratis bulanan Meta 1.000 sesi)
*   **Domain:** Rp 25.000 (Dicicil bulanan)
*   **ESTIMASI BIAYA: ± Rp 50.000 - Rp 150.000 / Bulan**

### FASE 2: Bertumbuh (1.000 - 5.000 Sesi Chat / Bulan)
*Asumsi: Aksena melayani 10 - 20 Klien Bisnis.*
*   **Firebase:** Rp 15.000 (Blaze Plan)
*   **Server Backend:** Rp 150.000 ($10/bln, RAM 1GB-2GB)
*   **AI Token:** Rp 150.000 - Rp 300.000 (Penggunaan GPT-4o-Mini / Gemini Flash)
*   **WhatsApp Meta:** Rp 500.000 - Rp 1.500.000 (Biaya *Service* / *User-initiated* conversation)
*   **Domain:** Rp 25.000
*   **ESTIMASI BIAYA: ± Rp 1.500.000 - Rp 2.500.000 / Bulan**

### FASE 3: Skala Enterprise (> 20.000 Sesi Chat / Bulan)
*Asumsi: Melayani ratusan klien besar atau memproses ratusan ribu transaksi.*
*   **Firebase:** Rp 450.000 - Rp 750.000
*   **Server Backend:** Rp 450.000 (CPU 4 Core & RAM 4GB)
*   **AI Token:** Rp 750.000 - Rp 1.500.000
*   **WhatsApp Meta:** Rp 6.000.000 - Rp 10.000.000+ (Tergantung masifnya *Broadcast*)
*   **ESTIMASI BIAYA: ± Rp 8.000.000 - Rp 15.000.000 / Bulan**

> **💡 Komponen Cost Terbesar:** WhatsApp Cloud API (70-90% total tagihan bulanan). Jangan pernah menjual "Unlimited Chat", harus menggunakan sistem Kuota/Token.

---

## 2. Usulan Skema Harga Aksena (Pricing Scheme)

Pola harga menggunakan **SaaS Pay-as-you-go** (Langganan + Top Up Kuota) untuk memastikan Profit/Margin positif.

### A. Biaya Setup Awal (One-Time Fee)
*   **Harga:** **Rp 750.000 - Rp 1.500.000**
*   **Include:** Verifikasi Meta Business, Setup WA API, Input Knowledge Base awal (The Brain & Manager).

### B. Biaya Berlangganan Dasar (Subscription Bulanan)
Menutupi biaya *fixed cost* (Server & Database).
1.  **Paket Basic (Rp 299.000 / Bulan)**
    *   1 Nomor WhatsApp, The Harvester, The Manager, AI The Closer.
    *   **Gratis 500 Kredit WA/AI pertama.**
2.  **Paket Pro (Rp 699.000 / Bulan) - BEST SELLER**
    *   Semua fitur Basic.
    *   Tersedia The Compass (Analitik) & The Marketer (Siaran Massal).
    *   **Gratis 1.500 Kredit WA/AI pertama.**

### C. Biaya Top-Up Kredit (Pay-as-you-go)
Menutupi biaya *variable cost* (Tagihan Meta & Token AI).
*1 Kredit = 1 Sesi Chat Masuk (Organik/Iklan).*
*2 Kredit = 1 Sesi Pengiriman Broadcast Promo.*

*   **Pkt. 1.000 Kredit:** Rp 750.000 (Harga per kredit: Rp 750)
*   **Pkt. 3.000 Kredit:** Rp 2.100.000 (Harga per kredit: Rp 700)
*   **Pkt. 10.000 Kredit:** Rp 6.000.000 (Harga per kredit: Rp 600)

*(Modal bersih rata-rata per chat ke Meta & API AI = ~Rp 400 - 500. Top-Up ini sangat aman bagi profit Aksena).*

---

## 3. Simulasi ROI Penjualan Klien (Kapasitas & Closing)

Simulasi ini menggunakan skema: **Paket Pro (Rp 699rb) + Top-Up 1.000 Kredit (Rp 750rb) = Total Biaya Klien Rp 1.449.000/Bulan**.
*   **Total Saldo Klien:** 2.500 Kredit.
*   **Kapasitas Layanan:** 2.500 *Leads/Pelanggan* yang masuk organically (Chat CS).
*   **Asumsi Harga Produk (AOV):** Rp 150.000 per transaksi.

Akan menghasilkan Omzet per Bulan sebagai berikut:

#### 📉 Skenario Minimum/Pesimis (Conversion Rate 3%)
*Asumsi trafik sangat dingin/baru iklan.*
*   **Total Closing:** 3% x 2.500 leads = **75 Transaksi**
*   **Omzet (Gross Revenue):** 75 x Rp 150.000 = **Rp 11.250.000**
*   **ROI (Laba vs Modal Aksena):** Rp 11,2 Juta vs Rp 1,4 Juta (Klien masih profit, perangkat lunak membiayai dirinya sendiri).

#### 📈 Skenario Realistis / Rata-Rata (Conversion Rate 10%)
*Asumsi audiens relevan dan AI berjalan ramah.*
*   **Total Closing:** 10% x 2.500 leads = **250 Transaksi**
*   **Omzet (Gross Revenue):** 250 x Rp 150.000 = **Rp 37.500.000**
*   **ROI (Laba vs Modal Aksena):** Aplikasi Aksena tiba-tiba terasa sangat murah (hanya **3,8%** dari total omzet klien).

#### 🚀 Skenario Maksimum/Optimis (Conversion Rate 20%)
*Asumsi repeat order (warm leads) / promo flash sale.*
*   **Total Closing:** 20% x 2.500 leads = **500 Transaksi**
*   **Omzet (Gross Revenue):** 500 x Rp 150.000 = **Rp 75.000.000**
*   **ROI (Laba vs Modal Aksena):** Menggantikan 2-3 Admin CS Manusia non-stop. Klien bergantung penuh pada Aksena.

---

## 4. Sales Script (Cara Menjual ke Calon Klien)

> *"Bapak/Ibu, hanya dengan menyisihkan **Rp 1,4 Juta** per bulan, Bapak/Ibu sudah mempekerjakan 'Robot CS Pintar' yang siap menyapa **2.500 prospek** dalam hitungan detik non-stop 24 jam."*
>
> *"Anggaplah performa robot ini di bulan terburuknya hanya mampu menghasilkan konversi (*closing rate*) **3%** saja. Secara nominal, Bapak/Ibu tetap mengantongi Omzet penjualan sebesar **Rp 11 Juta**. Modalnya kembali berkali lipat!"*
>
> *"Coba bayangkan, jika 2.500 pesan itu dibalas manusia siang dan malam secara manual, butuh berapa UMR karyawan CS yang harus Bapak/Ibu gaji? Aksena tidak butuh THR, tidak minta uang lembur, dan tidak pernah salah ketik harga."*
