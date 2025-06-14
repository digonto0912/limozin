'use client';
import { useState, useEffect } from 'react';
import { InformationCircleIcon, SwatchIcon } from '@heroicons/react/24/outline';
import Chart from './components/Chart';
import Table from './components/Table';
import AddEditModal from './components/AddEditModal';
import Loading from './components/Loading';
import Header from './components/Header';
import Dashboard from './components/Dashboard';

export default function Home() {
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'due', 'expiring'
  const [showColorInfo, setShowColorInfo] = useState(false);
  const [highlightEnabled, setHighlightEnabled] = useState(true); // Add highlight toggle state

  useEffect(() => {
    fetchRecords();
  }, []);

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

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
      showNotification('Failed to load records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredRecords = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    switch (activeFilter) {
      case 'due':
        return records.filter(record => record.dueBalance > 0);
      case 'expiring':
        return records.filter(record => {
          const passportExpiry = record.passportExpiry ? new Date(record.passportExpiry) : null;
          const idExpiry = record.idExpiry ? new Date(record.idExpiry) : null;
          
          return (passportExpiry && passportExpiry <= thirtyDaysFromNow) ||
                 (idExpiry && idExpiry <= thirtyDaysFromNow);
        });
      default:
        return records;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
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

  const handleSaveRecord = async (formData) => {
    try {
      const url = formData.id ? `/api/record/${formData.id}` : '/api/record';
      const method = formData.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save record');
      }

      showNotification(
        formData.id ? 'Record updated successfully' : 'Record added successfully'
      );
      handleCloseModal();
      fetchRecords();
    } catch (error) {
      console.error('Error saving record:', error);
      showNotification('Failed to save record', 'error');
    }
  };

  if (isLoading && records.length === 0) {
    return <Loading />;
  }

  const filteredRecords = getFilteredRecords();

  return (
    <div>
      <Header />
      <main className="main-content">
        <div className="dashboard-grid">
          <div className="stat-card">
            <h3>Total Records</h3>
            <div className="value">{records.length}</div>
          </div>
          <div className="stat-card">
            <h3>Expired Passports</h3>
            <div className="value">
              {records.filter(r => new Date(r.passportExpiry) < new Date()).length}
            </div>
          </div>
          <div className="stat-card">
            <h3>Expired IDs</h3>
            <div className="value">
              {records.filter(r => new Date(r.idExpiry) < new Date()).length}
            </div>
          </div>
          <div className="stat-card">
            <h3>Total Due Balance</h3>
            <div className="value">
               ﷼ {records.reduce((sum, r) => sum + (r.dueBalance || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="card chart-container">
          <Chart records={filteredRecords} />
        </div>

        <div className="card">          <div className="card-header">
            <h2>Records</h2>            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                className={`btn btn-light ${!highlightEnabled ? 'btn-light-active' : ''}`}
                onClick={() => setHighlightEnabled(!highlightEnabled)}
                title={highlightEnabled ? "Turn off highlighting" : "Turn on highlighting"}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '38px',
                  height: '38px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'transparent'
                }}
              >
                <SwatchIcon className="w-5 h-5" />
              </button>
              <button
                className="btn btn-light"
                onClick={() => setShowColorInfo(true)}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  height: '38px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'transparent'
                }}
              >
                <InformationCircleIcon className="w-5 h-5" />
                <span>Color Info</span>
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddRecord}
                style={{ height: '38px' }}
              >
                Add New Record
              </button>
            </div>
          </div>          <Table 
            records={filteredRecords}
            onEdit={handleEditRecord}
            onDelete={handleDeleteRecord}
            showColorInfo={showColorInfo}
            onColorInfoClose={() => setShowColorInfo(false)}
            highlightEnabled={highlightEnabled}
          />
        </div>

        {isModalOpen && (
          <AddEditModal
            record={editingRecord}
            onClose={handleCloseModal}
            onSave={handleSaveRecord}
          />
        )}

        {showToast && (
          <div className={`toast toast-${toastType}`}>
            {toastType === 'success' ? '✅' : '❌'} {toastMessage}
          </div>
        )}
      </main>
    </div>
  );
}
