// In development, use the backend server URL. In production, use relative paths
const API_BASE_URL = '/api';

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
