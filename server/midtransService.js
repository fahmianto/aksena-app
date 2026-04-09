const midtransClient = require('midtrans-client');

// Initialize Midtrans Snap client
const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-DUMMY',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-DUMMY'
});

const midtransService = {
    /**
     * Create a Snap Token for payment
     * @param {Object} details - Transaction details
     * @returns {Promise<Object>} - Snap response with token and redirect URL
     */
    createTransaction: async (userId, amount, type, description) => {
        const orderId = `AKS-${type}-${Date.now()}-${userId.slice(0, 5)}`;
        
        let parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount
            },
            credit_card: {
                secure: true
            },
            customer_details: {
                // Placeholder, will be enriched if user data passed
                user_id: userId
            },
            metadata: {
                userId,
                type, // 'TOPUP' or 'SUBSCRIPTION'
                description
            }
        };

        try {
            const transaction = await snap.createTransaction(parameter);
            return {
                success: true,
                token: transaction.token,
                redirect_url: transaction.redirect_url,
                orderId: orderId
            };
        } catch (error) {
            console.error('❌ Midtrans Create Error:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Verify Midtrans Signature for Webhook
     */
    verifyNotification: async (notificationJson) => {
        try {
            const statusResponse = await snap.transaction.notification(notificationJson);
            return statusResponse;
        } catch (error) {
            console.error('❌ Midtrans Verify Error:', error.message);
            return null;
        }
    }
};

module.exports = { midtransService };
