const express = require('express');
const router = express.Router();
const { fetchRecords, addRecord, updateRecord, deleteRecord } = require('../firebase/firestore');

// GET /api/records - Get all records
router.get('/', async (req, res) => {
  try {
    const records = await fetchRecords();
    res.json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

module.exports = router;
