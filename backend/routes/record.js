const { addRecord, updateRecord, deleteRecord } = require('../firebase/firestore');

const handlers = {
  // POST /api/record - Create a new record
  async post(req, res) {
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
  },

  // GET /api/record/:id - Get a single record
  async get(req, res) {
    try {
      const record = await fetchRecord(req.params.id);
      if (!record) {
        return res.status(404).json({ error: 'Record not found' });
      }
      res.json(record);
    } catch (error) {
      console.error('Error fetching record:', error);
      res.status(500).json({ error: 'Failed to fetch record' });
    }
  },

  // PUT /api/record/:id - Update a record
  async put(req, res) {
    try {
      const updatedRecord = {
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      await updateRecord(req.params.id, updatedRecord);
      res.json({ id: req.params.id, ...updatedRecord });
    } catch (error) {
      console.error('Error updating record:', error);
      res.status(500).json({ error: 'Failed to update record' });
    }
  },

  // DELETE /api/record/:id - Delete a record
  async delete(req, res) {
    try {
      await deleteRecord(req.params.id);
      res.json({ message: 'Record deleted successfully' });
    } catch (error) {
      console.error('Error deleting record:', error);
      res.status(500).json({ error: 'Failed to delete record' });
    }
  }
};

module.exports = handlers;
exports.default = handlers;
