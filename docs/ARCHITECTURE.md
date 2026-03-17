# Technical Architecture Diagram – Aksena.id v2.0

Data flow diagram: dari percakapan pelanggan hingga Big Data Dashboard.

---

## High-Level Data Flow

```mermaid
flowchart TD
    subgraph INGESTION["Layer 1: Omnichannel Ingestion (The Harvester)"]
        WA["WhatsApp Business API"]
        IG["Instagram DM"]
        SH["Shopee Chat"]
    end

    subgraph AI_CORE["Layer 2: Agentic AI Sales (The Closer)"]
        NLP["NLP Engine\n(GPT-4 / Gemini)"]
        SALES_AI["AI Sales Agent\n(Double Binding + Objection Handling)"]
        CATALOG["Product Catalog\n(Stock Check)"]
    end

    subgraph OPS["Layer 3 & 4: Operations (The Manager & Collector)"]
        PG["Payment Gateway\n(Auto Split Fee 0.5% - 5%)"]
        INV["Inventory Manager\n(Real-time Stock Sync)"]
    end

    subgraph DATA_LAYER["Layer 5: Operational Data Store"]
        PSQL[("PostgreSQL\n(Chat + Transaction Data)")]
    end

    subgraph BRAIN["Layer 6: Aksena Big Data (The Brain) 🔒 CONFIDENTIAL"]
        DE_ID["De-Identification Engine\n(Remove PII: Nama, HP, Alamat)"]
        DW[("BigQuery / ClickHouse\n(Analytical Data Warehouse)")]
        PREDICT["Predictive Demand Engine\n(TensorFlow / PyTorch)"]
        COMPASS["Market Compass Dashboard\n(Trend + Price Benchmarking)"]
    end

    subgraph CLIENTS["Output to Clients"]
        CLIENT_DASH["Client Dashboard\n(Market Compass)"]
        AUTO_FU["Auto Follow-Up\n(T-2 Hari Sebelum Stok Habis)"]
        PAY_LINK["Payment Link\nke Pelanggan"]
    end

    WA --> NLP
    IG --> NLP
    SH --> NLP

    NLP --> SALES_AI
    SALES_AI --> CATALOG
    SALES_AI --> PG
    PG --> PAY_LINK
    SALES_AI --> INV

    SALES_AI --> PSQL
    INV --> PSQL
    PG --> PSQL

    PSQL --> DE_ID
    DE_ID --> DW
    DW --> PREDICT
    DW --> COMPASS

    COMPASS --> CLIENT_DASH
    PREDICT --> AUTO_FU
```

---

## Component Breakdown

| Component                   | Tech                          | Layer               |
|-----------------------------|-------------------------------|---------------------|
| WhatsApp / IG / Shopee      | Official APIs / Webhooks      | Ingestion           |
| NLP Engine                  | GPT-4 / Gemini API            | AI Core             |
| AI Sales Agent              | LLM + Custom Prompt           | AI Core             |
| Product Catalog             | PostgreSQL                    | AI Core             |
| Payment Gateway             | Midtrans / Xendit             | Operations          |
| Inventory Manager           | Custom Service + PostgreSQL   | Operations          |
| Operational DB              | PostgreSQL                    | Data Store          |
| De-Identification Engine    | Custom Python Service 🔒      | Big Data            |
| Analytical Warehouse        | BigQuery / ClickHouse         | Big Data            |
| Predictive Engine           | TensorFlow / PyTorch          | Big Data            |
| Market Compass              | React Dashboard               | Client-Facing       |

---

## Data Privacy Compliance

Seluruh data disimpan di **server lokal Indonesia** sesuai **UU PDP No. 27/2022**.  
PII dihapus oleh **De-Identification Engine** sebelum masuk ke Data Warehouse.
