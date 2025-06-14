'use client';
import { useState, useEffect } from 'react';
import Chart from './components/Chart';
import Table from './components/Table';
import AddEditModal from './components/AddEditModal';
import Loading from './components/Loading';

// Icons
import { PlusIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await fetch('/api/records');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
      setError('Failed to load records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecord = async (formData) => {
    try {
      setIsLoading(true);
      const url = formData.id ? `/api/record/${formData.id}` : '/api/record';
      const method = formData.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save record');
      
      await fetchRecords();
      setIsModalOpen(false);
    } catch (error) {
      setError('Failed to save record. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Business Monitoring</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
              Add Record
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {/* Chart Section */}
          <section className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
              <Chart data={records} />
            </div>
          </section>

          {/* Table Section */}
          <section className="bg-white rounded-lg shadow overflow-hidden">
            <Table
              records={records}
              onEdit={(record) => {
                setEditingRecord(record);
                setIsModalOpen(true);
              }}
              isLoading={isLoading}
            />
          </section>
        </div>
      </main>

      {/* Modal */}
      <AddEditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
        record={editingRecord}
      />

      {/* Loading Overlay */}
      {isLoading && <Loading />}
    </div>
  );
}
