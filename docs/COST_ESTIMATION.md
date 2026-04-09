# 📊 Aksena.id Scalability & Cost Roadmap (v2.1)

Dokumen ini memberikan estimasi biaya operasional dan kapasitas klien Aksena.id dari tahap MVP hingga skala Enterprise Nasional.

---

## 🛠️ Komponen Biaya (Tech Stack)
1.  **AI Engine (ACI)**: Biaya per token untuk OpenAI (GPT-4o-mini) & Anthropic (Haiku).
2.  **WhatsApp Gateway**: Fonnte (Server-based) atau Meta Official Business API (Cloud-based).
3.  **Hosting (Backend)**: Railway.app (CPU/RAM Usage).
4.  **Database (Firestore)**: Biaya Read/Write/Storage data klien.
5.  **Notifications**: Mailketing API untuk Email & Alerts massal.

---

## 📈 Rincian Biaya Per Fase

### Fase 1: MVP / Personal (Validasi)
**Kapasitas: 1 - 5 Klien (Owner & Internal)**
*Cocok untuk: Testing fitur dan pembuktian model bisnis.*

| Komponen | Min (Free Tier) | Max (Starter) | Detail Breakdown |
| :--- | :--- | :--- | :--- |
| **AI (ACI)** | Rp 5.000 | Rp 16.000 | ~100 - 500 interaksi chat/bln. |
| **WA Gateway** | Rp 0 | Rp 50.000 | Fonnte Basic (1 Device). |
| **Hosting** | Rp 0 | Rp 80.000 | Railway Free vs Starter ($5). |
| **Lainnya** | Rp 0 | Rp 0 | Firestore & Email di bawah limit gratis. |
| **TOTAL / BLN** | **~Rp 5.000** | **~Rp 146.000** | **Rp 30k - 150k / Klien** |

---

### Fase 2: Startup (Growth Awal)
**Kapasitas: 10 - 50 Klien**
*Cocok untuk: Penetrasi pasar awal dan akuisisi leads.*

| Komponen | Min (Efisiensi) | Max (Standard) | Detail Breakdown |
| :--- | :--- | :--- | :--- |
| **AI (ACI)** | Rp 160.000 | Rp 480.000 | ~10.000 chat interaksi total. |
| **WA Gateway** | Rp 50.000 | Rp 150.000 | Fonnte Pro (Multi-number). |
| **Hosting & DB** | Rp 80.000 | Rp 160.000 | Railway Pro ($10) + DB Overages. |
| **Email API** | Rp 100.000 | Rp 200.000 | Mailketing Standard Plan. |
| **TOTAL / BLN** | **~Rp 390.000** | **~Rp 990.000** | **Rp 20k - 40k / Klien** |

---

### Fase 3: Pro - Medium Business (Scale Up)
**Kapasitas: 100 - 500 Klien**
*Cocok untuk: Stabilitas operasional dan profitabilitas maksimal.*

| Komponen | Min (Optimasi) | Max (Professional) | Detail Breakdown |
| :--- | :--- | :--- | :--- |
| **AI Engine** | Rp 1.600.000 | Rp 4.800.000 | Volume chat tinggi (50k+ chat/bln). |
| **WA Gateway** | Rp 450.000 | Rp 1.500.000 | Multi-device + redundansi gateway. |
| **Hosting & DB** | Rp 320.000 | Rp 800.000 | Resource scaling & DB Optimization. |
| **Maintenance** | Rp 500.000 | Rp 1.500.000 | Biaya monitoring & error handling. |
| **TOTAL / BLN** | **~Rp 2.870.000** | **~Rp 8.600.000** | **Rp 20k - 25k / Klien** |

---

### Fase 4: Enterprise (Nasional)
**Kapasitas: 1.000 - 10.000+ Klien**
*Cocok untuk: Korporasi besar dengan standar keamanan tinggi.*

| Komponen | Min (Enterprise) | Max (Corporate) | Detail Breakdown |
| :--- | :--- | :--- | :--- |
| **AI (Fine-tuned)** | Rp 10.000.000 | Rp 50.000.000 | Model khusus (Claude Sonnet/GPT-4o). |
| **WA Official API** | Rp 25.000.000 | Rp 100.000.000+ | Meta Cloud API (Bayar per sesi). |
| **Infra Dedicated** | Rp 5.000.000 | Rp 25.000.000 | AWS/GCP Dedicated Instance. |
| **Security & SLA** | Rp 10.000.000 | Rp 30.000.000 | Audit keamanan & guarantee uptime. |
| **TOTAL / BLN** | **~Rp 50.000.000** | **~Rp 205.000.000++** | **Rp 20k - 50k / Klien** |

---

## 📈 Metrik Penggunaan Per Fase (Asumsi Rata-rata)

Estimasi biaya di atas didasarkan pada metrik penggunaan per klien per bulan berikut ini:

| Metrik (Per Klien/Toko) | Fase 1: MVP | Fase 2: Startup | Fase 3: Growth | Fase 4: Enterprise |
| :--- | :--- | :--- | :--- | :--- |
| **Leads / Customers** | 10 - 50 | 100 - 500 | 500 - 2.000 | 5.000 - 20.000+ |
| **Total Chat Interaksi** | ~100 | ~500 | ~1.500 | ~5.000 - 10.000+ |
| **WhatsApp Blast/Sent** | ~50 | ~500 | ~2.000 | ~10.000+ |
| **Email Notifikasi** | ~50 | ~500 | ~2.000 | ~10.000+ |
| **AI Tokens (ACI Engine)** | ~100rb | ~500rb | ~2 Juta | ~10 - 50 Juta+ |

### 🧠 Detail Perhitungan AI Tokens (Brain Aksena):
1.  **Per Chat**: Rata-rata 1 interaksi membutuhkan **1.000 - 1.500 tokens** (termasuk System Prompt/Logic, History, dan AI Output).
2.  **Biaya GPT-4o-mini**: $0.15 per 1 Juta tokens (~Rp 2.400).
3.  **Kesimpulan**: Memproses 1.000 chat hanya butuh biaya AI murni sebesar **Rp 2.400**. Sangat efisien untuk skala besar!

### 📱 Detail Perhitungan WhatsApp & Email:
-   **Fase 1-3 (Fonnte)**: Biaya bulk/langganan, jadi tidak per-pesan. Semakin banyak kirim, semakin murah cost per pesannya.
-   **Fase 4 (Meta Official)**: Biaya **Rp 500 - Rp 1.000 per sesi chat** (Sesi 24 jam). Di fase ini, strategi profit harus lebih ketat karena Meta mengenakan biaya per interaksi.

---

## 💡 Strategi Profit (Monetisasi)
Agar bisnis tetap untung, disarankan skema pricing ke klien sebagai berikut:
1.  **Paket Basic (Rp 150k/bln)**: Profit margin ~70%.
2.  **Paket Pro (Rp 350k/bln)**: Untuk klien dengan traffic chat besar.
3.  **Paket BYO (Bring Your Own)**: Klien bayar sewa SaaS Rp 100k/bln, tapi biaya AI & WA mereka yang bayar sendiri ke provider.

*Estimasi dibuat berdasarkan harga API resmi per Q1 2024.*
