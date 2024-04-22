const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/get-secret/:location', async (req, res) => {
    const { location } = req.params;
    const query = 'SELECT secret_word FROM location_secrets WHERE location = ?';

    db.query(query, [location], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }
        if (results.length > 0) {
            res.json({ success: true, secret: results[0].secret_word });
        } else {
            res.status(404).json({ success: false, message: 'Secret not found for the specified location' });
        }
    });
});

module.exports = router;