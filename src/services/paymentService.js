/**
 * Aksena Payment Service (Midtrans Snap Integration)
 */

const MIDTRANS_SNAP_URL = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js';

const CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-DUMMY';

let isScriptLoaded = false;

/**
 * Dynamically load Midtrans Snap.js
 */
const loadSnapScript = () => {
    return new Promise((resolve) => {
        if (isScriptLoaded) return resolve();
        
        const script = document.createElement('script');
        script.src = MIDTRANS_SNAP_URL;
        script.setAttribute('data-client-key', CLIENT_KEY);
        script.onload = () => {
            isScriptLoaded = true;
            resolve();
        };
        document.body.appendChild(script);
    });
};

export const paymentService = {
    /**
     * Trigger Midtrans Snap Popup
     * @param {string} userId - Current user ID
     * @param {number} amount - Amount in IDR
     * @param {string} type - 'TOPUP' or 'SUBSCRIPTION'
     * @param {string} description - Item description
     */
    pay: async (userId, amount, type, description = '') => {
        await loadSnapScript();

        try {
            // 1. Request Snap Token from Backend
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payment/create-transaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, amount, type, description })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Gagal membuat transaksi');

            // 2. Open Snap Popup
            return new Promise((resolve, reject) => {
                window.snap.pay(data.token, {
                    onSuccess: (result) => {
                        console.log('✅ Payment Success:', result);
                        resolve(result);
                    },
                    onPending: (result) => {
                        console.log('⏳ Payment Pending:', result);
                        resolve(result);
                    },
                    onError: (error) => {
                        console.error('❌ Payment Error:', error);
                        reject(error);
                    },
                    onClose: () => {
                        console.log('🚪 Customer closed the popup without finishing the payment');
                        resolve({ status: 'closed' });
                    }
                });
            });
        } catch (error) {
            console.error('❌ Payment Service Error:', error);
            throw error;
        }
    }
};
