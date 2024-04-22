const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/check-code/:code', async (req, res) => {
    const { code } = req.params;

    if (!/^\d{5}$/.test(code)) {
        return res.status(400).json({ success: false, message: 'Invalid code format. Code must be exactly 5 digits.' });
    }

    const sql = 'SELECT * FROM Codes where code = ?';
    db.query(sql, [code], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }

        if (results.length > 0) {
            return res.status(200).json({ success: true, customerName: results[0].customer_name, location: results[0].location });
        } else {
            return res.status(404).json({ success: false, message: 'Code not found' });
        }
    });
});

router.post('/use-code/:code', (req, res) => {
    const { code } = req.params;

    if (!/^\d{5}$/.test(code)) {
        return res.status(400).json({ success: false, message: 'Invalid code format. Code must be exactly 5 digits.' });
    }

    const checkSql = 'SELECT used, date_used FROM Codes WHERE code = ?';
    db.query(checkSql, [code], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }

        if (results.length > 0 && results[0].used) {
            return res.status(409).json({ success: false, message: 'Code has already been used', dateUsed: results[0].date_used });
        }

        if (results.length > 0 && !results[0].used) {
            const updateSql = 'UPDATE Codes SET used = 1, date_used = NOW() WHERE code = ? AND (used IS NULL OR used = 0)';
            db.query(updateSql, [code], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ success: false, message: 'Database error', error: err.message });
                }
                if (result.affectedRows > 0) {
                    return res.status(200).json({ success: true, message: 'Code marked as used', dateUsed: results[0].date_used });
                } else {
                    return res.status(404).json({ success: false, message: 'Code not found or already used' });
                }
            });
        } else {
            return res.status(404).json({ success: false, message: 'Code not found' });
        }
    });
});

module.exports = router;