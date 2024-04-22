const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const db = require('../config/db');

router.post('/create-payment-intent', async (req, res) => {
    const { paymentMethodId, email, name, location } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 1000,
            currency: 'nok',
            payment_method: paymentMethodId,
            confirm: true,
            receipt_email: email,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never',
            }
        });

        const code = Math.floor(10000 + Math.random() * 90000).toString();

        const sqlInsertCodes = `
            INSERT INTO Codes (code, customer_email, customer_name, location)
            VALUES (?, ?, ?, ?);
        `;
        db.query(sqlInsertCodes, [code, email, name, location], (err, result) => {
            if (err) {
                console.error('Error during database operation:', err);
                res.status(500).json({ success: false, message: 'Database operation failed', error: er.message });
            }

            const sqlInsertProgress = `
                INSERT INTO progress (code, progressSequence, progressSecretWord)
                VALUES (?, ?, ?);
            `;
            db.query(sqlInsertProgress, [code, null, null], (err, result) => {
                if (err) {
                    console.error('Error during database operation:', err);
                    return res.status(500).json({ success: false, message: 'Database operation failed', error: err.message });
                }

                res.status(200).json({
                    success: true, 
                    message: 'Payment successful and data added to the database', 
                    intent: paymentIntent, 
                    code: code
                });
            });
        });
    } catch (error) {
        console.error('Error during payment process:', error);
        res.status(400).json({ success: false, message: 'Payment failed', error: error.message });
    }
});

module.exports = router;