import { fetchRecords, addRecord } from '../firebase/firestore.js';

export const handlers = {
  // GET /api/records - Get all records
  async get(req, res) {
    try {
      const records = await fetchRecords();
      res.json(records);
    } catch (error) {
      console.error('Error fetching records:', error);
      res.status(500).json({ error: 'Failed to fetch records' });
    }
  },

  // POST /api/records - Add a new record
  async post(req, res) {
    try {
      const record = await addRecord(req.body);
      res.status(201).json(record);
    } catch (error) {
      console.error('Error adding record:', error);
      res.status(500).json({ error: 'Failed to add record' });
    }
  }
};

export default handlers;
