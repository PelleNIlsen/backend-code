const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/update-progress', async (req, res) => {
    const { code, result, secretWord } = req.body;

    if (typeof code !== 'string' || typeof result !== 'boolean' || typeof secretWord !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid input data' });
    }

    try {
        const selectQuery = `SELECT progressSequence, progressSecretWord FROM progress WHERE code = ?`;
        db.query(selectQuery, [code], (err, results) => {
            if (err) {
                console.error('Database select error:', err);
                return res.status(500).json({ success: false, message: 'Database select operation failed', error: err.message });
            }

            if (results.length === 0) {
                return res.status(404).json({ success: false, message: 'Code not found' });
            }

            const currentSequence = results[0].progressSequence || '';
            const currentSecretWord = results[0].progressSecretWord || '';

            const newSequence = currentSequence + (result ? '1' : '0');
            const newSecretWord = secretWord;

            const updateQuery = `UPDATE progress SET progressSequence = ?, progressSecretWord = ? WHERE code = ?`;
            db.query(updateQuery, [newSequence, newSecretWord, code], (err, result) => {
                if (err) {
                    console.error('Database update error:', err);
                    return res.status(500).json({ success: false, message: 'Database update operation failed', error: err.message });
                }
                res.status(200).json({ success: true, message: 'Progress updated successfully' });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

router.get('/get-progress/:code', async (req, res) => {
    const { code } = req.params;

    if (!code) {
        return res.status(400).json({ success: false, message: 'Code is required' });
    }

    try {
        const sql = `SELECT progressSequence, progressSecretWord FROM progress WHERE code = ?`;
        db.query(sql, [code], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error', error: err.message });
            }

            if (results.length === 0) {
                return res.status(404).json({ success: false, message: 'Progress not found' });
            }

            const progress = results[0];
            if (progress.progressSequence && progress.progressSecretWord) {
                res.json({
                    success: true,
                    message: 'Progress retrieved successfully',
                    data: {
                        progressSequence: progress.progressSequence,
                        progressSecretWord: progress.progressSecretWord
                    }
                });
            } else {
                res.json({
                    success: true,
                    message: 'New game',
                    data: {
                        progressSequence: '',
                        progressSecretWord: ''
                    }
                });
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
})

module.exports = router;