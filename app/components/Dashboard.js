'use client';
import { useState, useEffect } from 'react';
import Chart from './Chart';
import Table from './Table';
import AddEditModal from './AddEditModal';
import Loading from './Loading';

export default function Dashboard() {
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);
  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/records');
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      } else {
        throw new Error('Failed to fetch records');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      // For development, set empty array if API fails
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSave = async (formData) => {
    try {
      let response;
      if (editingRecord) {
        // Update existing record
        response = await fetch(`/api/record/${editingRecord.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Add new record
        response = await fetch('/api/record', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }
      
      if (response.ok) {
        fetchRecords();
        setEditingRecord(null);
      } else {
        throw new Error('Failed to save record');
      }
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Error saving record. Please try again.');
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const response = await fetch(`/api/record/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchRecords();
        } else {
          throw new Error('Failed to delete record');
        }
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Error deleting record. Please try again.');
      }
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {isLoading && <Loading />}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Business Monitoring Dashboard</h1>
        <button
          onClick={() => {
            setEditingRecord(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Add New Record
        </button>
      </div>

      <Chart data={records} />
      
      <Table
        data={records}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AddEditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSave}
        record={editingRecord}
      />
    </main>
  );
}
