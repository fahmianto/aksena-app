# 🧠 MASTER DATA: AKSENA FEATURE TRACKER
**Status Update Terakhir: 2026-04-10 (Aksena v2.2 Production Ready)**
**Tujuan**: Dokumentasi tunggal (Ground Truth) untuk sinkronisasi antar sesi pengembangan.

---

## 🟢 1. FITUR SELESAI (DONE & READY)
Fitur yang sudah di-deploy dan berfungsi secara teknis di versi v2.2.

| Kategori | Fitur | Deskripsi |
| :--- | :--- | :--- |
| **Omni-channel** | WA Cloud API | Integrasi Meta Graph API untuk pengiriman pesan WA real-time. |
| **Omni-channel** | IG Comment Pivot | Balas publik di IG Comment -> Kirim DM Privat otomatis. |
| **AI Engine** | Multi-Agent Router | AI bisa membedakan Chat Biasa vs Cek Stok vs Tanya Resi. |
| **AI Engine** | VVIP Recognition | AI mengenali pelanggan lama, riwayat beli, & menu favorit. |
| **AI Engine** | Smart Liquidation | AI otomatis menawarkan produk "Dead Stock" (Zona Merah) saat chat. |
| **Marketing** | **Drip Campaign** | **[v2.2]** Nurturing otomatis berdasarkan segmentasi (H+1, H+3, dll). |
| **Inventory** | Global Stock Sync | Sinkronisasi stok terpusat antara Gudang & Marketplace. |
| **Dashboard** | Lead Pipeline UI | Visualisasi Kanban dengan icon channel (WA, IG, Shopee, dll). |
| **Billing** | Aksena Token | Sistem pengisian saldo (Top-up) untuk penggunaan AI & WA API. |
| **Billing** | **Midtrans Gateway** | **[v2.2]** Integrasi pembayaran via Snap (Sandbox) & Auto-update Token. |
| **Security** | **Admin Role** | **[v2.2]** RBAC (Role-Based Access Control) untuk data finansial & settings. |

---

## 🟡 2. DALAM PROSES (IN PROGRESS)
Fitur yang sedang dalam tahap pengembangan/finishing.

| Fitur | Status | Target Selanjutnya |
| :--- | :--- | :--- |
| Marketplace Sync | 80% | Implementasi Real API (saat ini logic core sync 5 channel sudah ready). |
| Financial Tracking | 60% | Dashboard Billing sudah ada, tinggal perincian profit/loss per lead. |
| ACI Advanced | 70% | Voice interaction & Analisis trend pasar berbasis chat history. |

---

## 🔵 3. RENCANA MENDATANG (BACKLOG / ROADMAP)
Fitur yang sudah direncanakan tapi belum mulai dikerjakan.

| Fitur | Prioritas | Detail Konsep |
| :--- | :--- | :--- |
| Export Database | Tinggi | Satu klik download database Lead/Pelanggan ke Excel (CSV). |
| Midtrans Auto-Split | Tinggi | Potong biaya sukses (success fee) 0.5% otomatis saat bayar. |
| Market Compass | Menengah | Dashboard trend produk nasional berbasis Big Data Aksena (Anonim). |
| Mobile App (PWA) | Menengah | Versi aplikasi ringan untuk owner cek orderan dari HP. |
| AI Voice Note | Rendah | AI bisa membalas pesan WA menggunakan Voice Note (Text-to-Speech). |

---

## 🛠️ KONFIGURASI TEKNIS (REFERENSI DEVELOPER)
- **Backend**: Node.js (Express) @ Railway
- **Frontend**: React (Vite) @ Firebase Hosting
- **Database**: Firebase Firestore
- **AI**: OpenAI (GPT-4o-mini) & Anthropic (Claude 3.5 Haiku)
- **Messaging**: Meta Graph API (WA & IG) & Mailketing (Notif)
- **Storage**: Collections: `users`, `aksena_leads`, `products`, `transactions`, `tokens`, `drip_sequences`.

---

> [!IMPORTANT]
> **CATATAN UNTUK DEVELOPER**: Selalu update file ini SETIAP kali ada fitur baru yang selesai diprogram agar sinkronisasi antar agen tetap terjaga. File ini adalah **"Otak Kedua"** Aksena.
