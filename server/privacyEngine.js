/**
 * Aksena Privacy Engine (De-Identification Layer)
 * Sesuai PRD v2.0: Menghapus PII (Personally Identifiable Information) 
 * untuk keperluan pengolahan Big Data.
 */

const privacyEngine = {
    /**
     * Masking PII (Nama, HP, Email, Alamat) dalam teks
     * @param {string} text - Teks mentah dari chat
     * @returns {string} - Teks tersensor
     */
    maskPII: (text) => {
        if (!text || typeof text !== 'string') return text;

        let masked = text;

        // 1. Masking Nomor Telepon (Regex: mendeteksi deretan angka > 8 digit)
        masked = masked.replace(/(?:\+62|62|08)[0-9\s-]{8,15}/g, '[PHONE_SENSITIVE]');

        // 2. Masking Email
        masked = masked.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_SENSITIVE]');

        // 3. Masking Alamat (Heuristic: Jalan, Jl., Blok, No.)
        // Ini lebih ke pattern recognition sederhana
        const addressPattern = /(?:Jalan|Jl\.|Blok|Kav\.|No\.)\s+[A-Za-z0-9\s,.]{5,50}/gi;
        masked = masked.replace(addressPattern, '[ADDRESS_SENSITIVE]');

        return masked;
    },

    /**
     * Anonymize Lead Object
     */
    anonymizeLead: (lead) => {
        return {
            ...lead,
            name: '[NAME_ANONYMOUS]',
            phone: lead.phone ? lead.phone.substring(0, 4) + '****' : null,
            email: lead.email ? '****@****.com' : null,
            ig_sid: lead.ig_sid ? 'IG_****' : null
        };
    }
};

module.exports = { privacyEngine };
