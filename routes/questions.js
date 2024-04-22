const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/questions/:location', (req, res) => {
    const { location } = req.params;

    const sql = 'SELECT * FROM questions WHERE location = ?';

    db.query(sql, [location], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ success: false, message: 'Database error', error: err.message });
        } else {
            res.json({ success: true, data: results });
        }
    });
});

module.exports = router;