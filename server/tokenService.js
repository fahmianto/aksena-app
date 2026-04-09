const admin = require('firebase-admin');

// Costs in Tokens
const TOKEN_COSTS = {
    AI_CHAT: 10,
    WA_SENT: 5,
    EMAIL_SENT: 2,
    ASL_ALERT: 3
};

const tokenService = {
    /**
     * Get current token balance for a user
     */
    getBalance: async (db, userId) => {
        const userSnap = await db.collection('users').doc(userId).get();
        if (!userSnap.exists) return 0;
        return userSnap.data().tokenBalance || 0;
    },

    /**
     * Deduct tokens and log transaction
     */
    deduct: async (db, userId, type, description = '') => {
        const cost = TOKEN_COSTS[type] || 0;
        if (cost === 0) return { success: true };

        const userRef = db.collection('users').doc(userId);

        try {
            return await db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                const currentBalance = userDoc.data()?.tokenBalance || 0;

                if (currentBalance < cost) {
                    return { success: false, error: 'INSUFFICIENT_TOKENS', balance: currentBalance };
                }

                const newBalance = currentBalance - cost;
                transaction.update(userRef, { tokenBalance: newBalance });

                // Log Transaction
                const logRef = db.collection('token_transactions').doc();
                transaction.set(logRef, {
                    userId,
                    amount: -cost,
                    type,
                    description,
                    balanceAfter: newBalance,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });

                return { success: true, newBalance };
            });
        } catch (error) {
            console.error('❌ Token Deduction Error:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Add tokens (Top-up)
     */
    add: async (db, userId, amount, description = 'Top-up') => {
        const userRef = db.collection('users').doc(userId);
        
        try {
            await userRef.set({ tokenBalance: admin.firestore.FieldValue.increment(amount) }, { merge: true });
            
            await db.collection('token_transactions').add({
                userId,
                amount,
                type: 'TOPUP',
                description,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('❌ Token Top-up Error:', error.message);
            return { success: false, error: error.message };
        }
    }
};

module.exports = { tokenService, TOKEN_COSTS };
