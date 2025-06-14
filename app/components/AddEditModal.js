'use client';
import { Fragment, useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function AddEditModal({ record = null, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    passportExpiry: '',
    idNumber: '',
    idExpiry: '',
    joinDate: '',
    phone: '',
    dueBalance: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({
        ...record,
        passportExpiry: record.passportExpiry?.split('T')[0] || '',
        idExpiry: record.idExpiry?.split('T')[0] || '',
        joinDate: record.joinDate?.split('T')[0] || '',
        dueBalance: record.dueBalance?.toString() || '',
      });
    }
  }, [record]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (formData.dueBalance && isNaN(Number(formData.dueBalance))) {
      newErrors.dueBalance = 'Due balance must be a number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        id: record?.id,
        dueBalance: Number(formData.dueBalance) || 0
      });
    } catch (error) {
      setErrors({ submit: 'Failed to save record. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Add event listener for escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{record ? 'Edit Record' : 'Add New Record'}</h2>
          <button className="close-button" onClick={onClose}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              placeholder="Enter name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueBalance">Due Balance</label>
              <input
                type="text"
                id="dueBalance"
                placeholder="Enter amount"
                value={formData.dueBalance}
                onChange={(e) => setFormData({ ...formData, dueBalance: e.target.value })}
                className={errors.dueBalance ? 'error' : ''}
              />
              {errors.dueBalance && <span className="error-message">{errors.dueBalance}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="idNumber">ID Number</label>
              <input
                type="text"
                id="idNumber"
                placeholder="Enter ID number"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="idExpiry">ID Expiry Date</label>
              <input
                type="date"
                id="idExpiry"
                value={formData.idExpiry}
                onChange={(e) => setFormData({ ...formData, idExpiry: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="passportExpiry">Passport Expiry Date</label>
              <input
                type="date"
                id="passportExpiry"
                value={formData.passportExpiry}
                onChange={(e) => setFormData({ ...formData, passportExpiry: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="joinDate">Join Date</label>
              <input
                type="date"
                id="joinDate"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              placeholder="Enter additional notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-light" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
