const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002/api';

export const api = {
  async fetchRecords() {
    const response = await fetch(`${API_BASE_URL}/records`);
    if (!response.ok) {
      throw new Error('Failed to fetch records');
    }
    return response.json();
  },

  async addRecord(record) {
    const response = await fetch(`${API_BASE_URL}/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      throw new Error('Failed to add record');
    }
    return response.json();
  },

  async updateRecord(id, record) {
    const response = await fetch(`${API_BASE_URL}/record/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      throw new Error('Failed to update record');
    }
    return response.json();
  },

  async deleteRecord(id) {
    const response = await fetch(`${API_BASE_URL}/record/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete record');
    }
    return response.json();
  },
};
