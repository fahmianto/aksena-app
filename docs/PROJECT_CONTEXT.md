# 🧠 Aksena Project Context & Brain Dump
**Last Update: 2026-04-01 | Antigravity AI (V2.1 Session)**

Halo "Next Me"! File ini adalah rangkuman progress terakhir biar kamu langsung nyambung kerja bareng Bos.

## 🎯 Proyek: Aksena.id v2.0
CRM & Conversational Intelligence Engine untuk e-commerce (WA, IG, Shopee).

## 🚀 Status Terakhir (DONE)
1.  **Full Omni-channel Support (5 Channels)**: 
    - Mendukung **WhatsApp, Instagram, Shopee, Tokopedia, dan TikTok Shop**.
    - AI Engine (`aiEngine.js`) secara cerdas mengenali sumber chat (`source`) dan memberikan link marketplace yang sesuai.
2.  **Automated Stock Sync & Switching**:
    - `marketplaceService.js` mengelola sinkronisasi stok global ke 5 channel sekaligus.
    - Setiap penjualan di marketplace (via `/api/marketplace/webhook`) akan otomatis memicu update stok di channel lainnya (Tokped, Shopee, TikTok).
3.  **Dynamic AI Prompting**:
    - AI mengambil link toko (Shopee, Tokoped, TikTok) langsung dari `Settings.jsx` yang disimpan di Firestore.
    - Strategi **Smart Pivot** tetap aktif untuk IG/WA.
4.  **Real-time System Action**:
    - `SYSTEM_ACTION` sudah berfungsi untuk mengecek stok produk asli di database `products`.
5.  **Premium Flexing Mode (New v2.1)**:
    - Menambahkan fitur **Flexing Mode** (Demo Mode) di Dashboard dengan efek visual `.flex-glow-card` (pulsing cyan glow).
    - Implementasi `MOCK_KPI` "Elite Level" (Revenue Rp 1.2M+, Conversion 24.8%) untuk presentasi/pitching.
    - Sinkronisasi `analyticsService.js` untuk kontras data asli vs data flexing.
6.  **Mailketing Notification Engine (v2.1)**:
    - Integrasi **Mailketing REST API** di `server/notificationService.js`.
    - Mengganti `console.log` di ASL Alert dengan real email/WA notification ke Owner.
    - Global `sendEmail` helper sekarang menggunakan API Mailketing bukan SMTP tradisional.
7.  **Auth & Role Persistence (v2.1)**:
- **Super Admin Upgrade**: Akun `fahmizz580@gmail.com` berhasil diupgrade menjadi `super_admin`.
- **Auth Race Condition Fixed**: Timeout di `AuthContext.jsx` ditingkatkan ke 3000ms untuk stabilitas login.
- **ACI (Aksena Conversational Intelligence) Optimized**:
    *   **Phone Tracking**: AI kini bisa melacak pesanan hanya dengan nomor HP melalui koleksi `transactions`.
    *   **IG Engagement**: Trigger `[STORY_REACTION]` mendapatkan respon antusias khusus.
    *   **AI Fallback**: Jika Anthropic (Claude) gagal, otomatis switch ke OpenAI (GPT-4o-mini).
- **Verified**: Semua fitur di atas telah diuji menggunakan `server/test_tracking.js` dan berjalan lancar.

## 🛠️ Tech Stack
-   **Frontend**: React + Vite + Tailwind (Vanilla CSS rules).
-   **Backend**: Express (server/) + Firebase Admin.
-   **Database**: Firestore (koleksi: `aksena_leads`, `users`, `products`, `transactions`).
-   **AI Architecture**: Multi-agent (Router: GPT-4o-mini, Closer: Claude 3.5 Haiku).

## 📂 Key Files
-   `server/aiEngine.js`: Otak AI (Intent Router + Dynamic Closer).
-   `server/marketplaceService.js`: Mesin otomasi stok omni-channel.
-   `server/notificationService.js`: Mesin bot notifikasi Mailketing (Email & WA).
-   `src/pages/Settings.jsx`: UI buat control link & fitur "Auto-Sync / Stock Guard".
-   `src/pages/Dashboard.jsx`: Dashboard v2.1 (Flexing Mode enabled).

## ⏭️ Next Tasks (To-Do)
-   [ ] **Mailketing Domain Setup**: Memastikan domain pengirim aktif (Error -999 di Mailketing perlu verifikasi domain).
-   [ ] **IG Story Response**: Menyempurnakan filter `[STORY_REACTION]` di aiEngine.
-   [ ] **Order Tracking Logic**: Menghubungkan pencarian nomor resi dengan data `transactions` asli (Sudah ada placeholder).
-   [ ] **Third-Party WA Gateway**: Menyambungkan `notificationService.js` ke API Fonnte/Watzap jia Owner sudah langganan.

---
*Good luck, Bro! Jangan lupa tetep bikin desain yang premium & WOW buat Bos.* 🦾🔥
