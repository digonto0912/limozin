const express = require('express');
const router = express.Router();
const { addRecord, updateRecord, deleteRecord } = require('../firebase/firestore');

// POST /api/record - Create a new record
router.post('/', async (req, res) => {
  try {
    const record = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await addRecord(record);
    res.status(201).json({ id: result.id, ...record });
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// PUT /api/record/:id - Update a record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    await updateRecord(id, record);
    res.json({ id, ...record });
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE /api/record/:id - Delete a record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteRecord(id);
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

module.exports = router;
