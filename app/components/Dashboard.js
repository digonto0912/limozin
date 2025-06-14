'use client';
import { useState, useEffect } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import Table from './Table';
import Chart from './Chart';
import AddEditModal from './AddEditModal';
import Loading from './Loading';
import Header from './Header';

export default function Dashboard({ 
  isLoading, 
  records, 
  activeFilter, 
  setActiveFilter,
  showColorInfo, 
  setShowColorInfo,
  highlightEnabled,
  setHighlightEnabled
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

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
      showNotification('Failed to fetch records', 'error');
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddRecord = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const response = await fetch(`/api/record/${id}`, { method: 'DELETE' });
        if (response.ok) {
          showNotification('Record deleted successfully');
          fetchRecords();
        } else {
          throw new Error('Failed to delete record');
        }
      } catch (error) {
        showNotification('Failed to delete record', 'error');
      }
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="dashboard">
      <Header />
      
      <div className="button-group">
        <button
          className="icon-button"
          onClick={() => setHighlightEnabled(!highlightEnabled)}
          title={highlightEnabled ? "Disable Row Highlighting" : "Enable Row Highlighting"}
        >
          <img 
            src="/window.svg" 
            alt="Toggle Highlighting"
            style={{ opacity: highlightEnabled ? 1 : 0.5 }}
          />
        </button>
        <button
          className="icon-button"
          onClick={() => setShowColorInfo(true)}
          title="Show Color Information"
        >
          <InformationCircleIcon className="h-6 w-6" />
        </button>
        <button
          className="add-button"
          onClick={() => {
            setEditingRecord(null);
            setIsModalOpen(true);
          }}
        >
          Add New Record
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Total Records</h3>
          <div className="value">{records.length}</div>
        </div>
        <div className="stat-card">
          <h3>Expired Passports</h3>
          <div className="value">{records.filter(r => new Date(r.passportExpiry) < new Date()).length}</div>
        </div>
        <div className="stat-card">
          <h3>Expired IDs</h3>
          <div className="value">{records.filter(r => new Date(r.idExpiry) < new Date()).length}</div>
        </div>
        <div className="stat-card">
          <h3>Total Due Balance</h3>
          <div className="value"> ﷼ {records.reduce((sum, r) => sum + (r.dueBalance || 0), 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="card chart-container">
        <Chart records={records} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
      </div>

      <div className="card">
        <Table 
          records={records} 
          onEdit={handleEditRecord}
          onDelete={handleDeleteRecord}
          highlightEnabled={highlightEnabled}
          showColorInfo={showColorInfo}
          onColorInfoClose={() => setShowColorInfo(true)}
        />
      </div>

      {isModalOpen && (
        <AddEditModal
          record={editingRecord}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            fetchRecords();
            setIsModalOpen(false);
            showNotification(editingRecord ? 'Record updated successfully' : 'Record added successfully');
          }}
        />
      )}

      {showToast && (
        <div className={`toast toast-${toastType}`}>
          {toastType === 'success' ? '✅' : '❌'} {toastMessage}
        </div>
      )}
    </div>
  );
}
