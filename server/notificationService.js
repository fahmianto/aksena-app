const fetch = require('node-fetch');
const { tokenService } = require('./tokenService');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const MAILKETING_API_URL = 'https://api.mailketing.co.id/api/v1/send';

const notificationService = {
  /**
   * Helper: Ambil Config API mandiri dari User Profile
   */
  getUserConfigs: async (db, userId) => {
    if (!db || !userId) return null;
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      return userDoc.exists ? userDoc.data() : null;
    } catch {
      return null;
    }
  },

  /**
   * Mengirim email via Mailketing REST API
   */
  sendEmail: async (to, subject, content, db = null, userId = null) => {
    // 1. Token Check (Deduce if context provided)
    if (db && userId) {
      const tokenCheck = await tokenService.deduct(db, userId, 'EMAIL_SENT', `Email to: ${to}`);
      if (tokenCheck && !tokenCheck.success && tokenCheck.error === 'INSUFFICIENT_TOKENS') {
        return { success: false, error: 'INSUFFICIENT_TOKENS', message: 'Token tidak cukup' };
      }
    }
    // 1b. BYO-API Check
    const userConfig = await notificationService.getUserConfigs(db, userId);
    const token = userConfig?.mailketingToken || process.env.MAILKETING_API_TOKEN;
    const fromEmail = userConfig?.mailketingFromEmail || process.env.MAILKETING_FROM_EMAIL || 'admin@aksena.id';
    const fromName = userConfig?.business || process.env.MAILKETING_FROM_NAME || 'Aksena Omni Intelligence';

    if (!token || token === 'isi_token_lo_disini') {
      console.warn('⚠️ Mailketing API Token belum di-setting di .env');
      return { success: false, error: 'Missing API Token' };
    }

    try {
      const response = await fetch(MAILKETING_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api_token: token,
          from_name: fromName,
          from_email: fromEmail,
          recipient: to,
          subject: subject,
          content: content,
        }),
      });

      const result = await response.json();
      console.log('📬 Mailketing API Response:', result);

      if (result.status === 'success' || result.code === 200) {
        return { success: true, data: result };
      } else {
        return { success: false, error: result.message || 'Unknown error' };
      }
    } catch (error) {
      console.error('❌ Notification service error:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Mengirim WhatsApp (Hybrid Strategy)
   * @param {string} type - 'SERVICE' (Meta Official) atau 'MARKETING' (Gateway)
   */
  sendWA: async (to, message, db = null, userId = null, type = 'SERVICE') => {
    // 1. Token Check
    if (db && userId) {
      const tokenCheck = await tokenService.deduct(db, userId, 'WA_SENT', `WA ${type} to: ${to}`);
      if (tokenCheck && !tokenCheck.success && tokenCheck.error === 'INSUFFICIENT_TOKENS') {
        return { success: false, error: 'INSUFFICIENT_TOKENS', message: 'Token tidak cukup' };
      }
    }

    // 2. ROUTING LOGIC
    // Kategori SERVICE/UTILITY -> Pakai Meta Official (Stabil, Profesional)
    // Kategori MARKETING/BROADCAST -> Pakai Gateway (Fonnte/Wablas) (Hemat Cost)
    
    if (type === 'SERVICE') {
        return await notificationService.sendWAMeta(to, message, db, userId);
    } else {
        return await notificationService.sendWAGateway(to, message, db, userId);
    }
  },

  /**
   * Jalur Meta Official (WhatsApp Cloud API)
   */
  sendWAMeta: async (to, message, db = null, userId = null) => {
    const userConfig = await notificationService.getUserConfigs(db, userId);
    const whatsappToken = userConfig?.waToken || process.env.WA_ACCESS_TOKEN;
    const phoneNumberId = userConfig?.waPhoneId || process.env.WA_PHONE_NUMBER_ID;

    if (!whatsappToken || !phoneNumberId || whatsappToken === 'DUMMY') {
      console.warn('⚠️ [META Official] Token/ID DUMMY. Mode simulasi.');
      return { success: true, simulation: true };
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'text',
          text: { body: message },
        }),
      });

      const result = await response.json();
      if (result.messages) {
        console.log(`✅ [META Official] Sent to ${to}`);
        return { success: true, data: result };
      } else {
        console.error('❌ [META ERROR]:', result);
        return { success: false, error: result.error?.message || 'Unknown error' };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Jalur Gateway Ketiga (Contoh: Fonnte - Harga Flat/Unlimited)
   */
  sendWAGateway: async (to, message, db = null, userId = null) => {
    const userConfig = await notificationService.getUserConfigs(db, userId);
    const gatewayToken = userConfig?.fonnteToken || process.env.WA_GATEWAY_TOKEN || process.env.WATZAP_TOKEN;
    
    if (!gatewayToken || gatewayToken === 'DUMMY') {
      console.warn('⚠️ [WA Gateway] Token DUMMY. Cek variabel WA_GATEWAY_TOKEN atau WATZAP_TOKEN di .env.');
      return { success: true, simulation: true };
    }

    try {
      // Contoh integrasi Fonnte (Bisa disesuaikan dengan Wablas/WooWA)
      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': gatewayToken,
        },
        body: new URLSearchParams({
          target: to,
          message: message,
          delay: '2', // Delay manual agar natural
          countryCode: '62'
        }),
      });

      const result = await response.json();
      if (result.status) {
        console.log(`✅ [WA Gateway] Sent to ${to}`);
        return { success: true, data: result };
      } else {
        console.error('❌ [Gateway ERROR]:', result);
        return { success: false, error: result.reason || 'Unknown error' };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Mengirim Instagram DM via Meta Graph API
   */
  sendInstagramDM: async (recipientId, message) => {
    const igToken = process.env.IG_ACCESS_TOKEN;
    if (!igToken || igToken === 'DUMMY') {
      console.log(`📸 [IG DM Simulation] Sending to ${recipientId}: ${message}`);
      return { success: true, simulation: true };
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/me/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${igToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: message },
        }),
      });

      const result = await response.json();
      return result.message_id ? { success: true } : { success: false, error: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Membalas Komentar IG secara publik
   */
  replyInstagramComment: async (commentId, message) => {
    const igToken = process.env.IG_ACCESS_TOKEN;
    if (!igToken || igToken === 'DUMMY') {
      console.log(`📸 [IG Comment Simulation] Replying to ${commentId}: ${message}`);
      return { success: true, simulation: true };
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${commentId}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${igToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const result = await response.json();
      return result.id ? { success: true } : { success: false, error: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Fungsi universal untuk notifikasi Owner (ASL, dsb)
   */
  notifyOwner: async (title, message) => {
    const ownerToken = process.env.OWNER_PHONE; // Bisa Email atau WA
    console.log(`🔔 Notifying Owner: ${title}`);
    
    // Kirim Email Default ke Owner
    await notificationService.sendEmail(
      process.env.MAILKETING_FROM_EMAIL, 
      `🔔 [AKSENA ALERT] ${title}`,
      `<h3>Aksena Omni-Channel Intelligence</h3><p>${message}</p>`
    );

    // Kirim WA (Simulation)
    await notificationService.sendWA(ownerToken, `🔔 *[AKSENA ALERT]*\n\n${message}`);
  }
};

module.exports = notificationService;
