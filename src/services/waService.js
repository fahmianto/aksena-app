/**
 * waService.js — WhatsApp Business API Integration Layer
 *
 * Aksena connects to WhatsApp via Meta's Cloud API (Graph API).
 * For webhook events, deploy the Express backend from /backend directory.
 *
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const WA_API_URL = 'https://graph.facebook.com/v19.0';
const PHONE_NUMBER_ID = import.meta.env.VITE_WA_PHONE_NUMBER_ID;
const WA_TOKEN       = import.meta.env.VITE_WA_TOKEN;

/**
 * Send a WhatsApp text message to a recipient.
 * @param {string} to - Recipient WA number in format "628xxxxxxxxxx"
 * @param {string} body - Message body text
 */
export async function sendWAMessage(to, body) {
  if (!PHONE_NUMBER_ID || !WA_TOKEN) {
    console.warn('[waService] WA env vars not configured. Add VITE_WA_PHONE_NUMBER_ID and VITE_WA_TOKEN to .env');
    return { simulated: true };
  }

  const res = await fetch(`${WA_API_URL}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to send WA message');
  }

  return res.json();
}

/**
 * Send a WhatsApp template message (for order confirmations etc).
 * @param {string} to
 * @param {string} templateName
 * @param {string} languageCode
 * @param {Array}  components
 */
export async function sendWATemplate(to, templateName, languageCode = 'id', components = []) {
  if (!PHONE_NUMBER_ID || !WA_TOKEN) {
    console.warn('[waService] WA env vars not configured.');
    return { simulated: true };
  }

  const res = await fetch(`${WA_API_URL}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: { name: templateName, language: { code: languageCode }, components },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to send WA template');
  }

  return res.json();
}

/**
 * Parse an incoming webhook event from Meta's WA Cloud API.
 * Call this in your backend webhook handler.
 *
 * Expected webhook event structure: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples
 */
export function parseWebhookMessage(body) {
  try {
    const entry   = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value   = changes?.value;
    const message = value?.messages?.[0];
    const contact = value?.contacts?.[0];

    if (!message) return null;

    return {
      messageId:   message.id,
      from:        message.from,           // WA number
      name:        contact?.profile?.name ?? 'Unknown',
      type:        message.type,           // 'text' | 'image' | 'audio' etc
      text:        message.text?.body ?? null,
      timestamp:   new Date(Number(message.timestamp) * 1000),
      phoneNumberId: value.metadata?.phone_number_id,
    };
  } catch {
    return null;
  }
}

/**
 * Webhook verification (for Meta's verification handshake).
 * Mount at GET /webhook on your Express backend.
 */
export function verifyWebhook(req, verifyToken) {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    return challenge;
  }
  return null;
}

export const WA_CONFIG = {
  webhookVerifyToken: import.meta.env.VITE_WA_VERIFY_TOKEN,
  phoneNumberId:      PHONE_NUMBER_ID,
};
