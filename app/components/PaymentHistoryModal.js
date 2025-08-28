'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import moment from 'moment';

export default function PaymentHistoryModal({ person, isOpen, onClose }) {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    type: 'payment', // 'payment' or 'charge'
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isOpen && person) {
      fetchPaymentHistory();
    }
  }, [isOpen, person]);

  // Add modal-open class to body when modal is mounted
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    }
  }, [isOpen]);

  const fetchPaymentHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/payment-history?personId=${person.id}`);
      if (!response.ok) {
        // If the endpoint doesn't exist yet, return empty array
        if (response.status === 404) {
          console.log('Payment history collection not found, starting with empty history');
          setPaymentHistory([]);
          return;
        }
        throw new Error('Failed to fetch payment history');
      }
      const data = await response.json();
      setPaymentHistory(data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      // For now, just start with empty history instead of showing error
      setPaymentHistory([]);
      setError(null); // Don't show error to user yet
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (!newPayment.amount || isNaN(Number(newPayment.amount))) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const paymentData = {
        personId: person.id,
        personName: person.name,
        amount: Number(newPayment.amount),
        type: newPayment.type,
        description: newPayment.description,
        date: new Date(newPayment.date).toISOString(),
      };

      const response = await fetch('/api/payment-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Failed to add payment record');
      }

      // Reset form
      setNewPayment({
        amount: '',
        type: 'payment',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddPayment(false);
      
      // Refresh payment history
      await fetchPaymentHistory();
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Failed to add payment record');
    }
  };

  const formatCurrency = (amount) => {
    return ` ﷼ ${Math.abs(amount).toLocaleString()}`;
  };

  const calculateRunningBalance = () => {
    let balance = 0;
    return paymentHistory.map(transaction => {
      if (transaction.type === 'payment') {
        balance -= transaction.amount;
      } else {
        balance += transaction.amount;
      }
      return { ...transaction, runningBalance: balance };
    }).reverse(); // Show newest first
  };

  const transactionsWithBalance = calculateRunningBalance();
  const totalPaid = paymentHistory.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0);
  const totalCharges = paymentHistory.filter(t => t.type === 'charge').reduce((sum, t) => sum + t.amount, 0);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Payment History</h2>
            <p className="text-gray-600">{person?.name}</p>
          </div>
          <button className="close-button" onClick={onClose}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="payment-summary">
          <div className="summary-card">
            <h4>Total Charges</h4>
            <div className="amount positive">{formatCurrency(totalCharges)}</div>
          </div>
          <div className="summary-card">
            <h4>Total Payments</h4>
            <div className="amount negative">{formatCurrency(totalPaid)}</div>
          </div>
          <div className="summary-card">
            <h4>Current Due</h4>
            <div className={`amount ${person?.dueBalance > 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(person?.dueBalance || 0)}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddPayment(!showAddPayment)}
          >
            <PlusIcon className="h-4 w-4" />
            Add Transaction
          </button>
        </div>

        {showAddPayment && (
          <div className="add-payment-form">
            <h4>Add New Transaction</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select
                  value={newPayment.type}
                  onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value })}
                >
                  <option value="payment">Payment (Credit)</option>
                  <option value="charge">Charge (Debit)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={newPayment.date}
                  onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={newPayment.description}
                onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setShowAddPayment(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddPayment}>
                Add Transaction
              </button>
            </div>
          </div>
        )}

        <div className="payment-history-content">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading payment history...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button className="btn btn-secondary" onClick={fetchPaymentHistory}>
                Retry
              </button>
            </div>
          ) : transactionsWithBalance.length === 0 ? (
            <div className="empty-state">
              <p>No payment history found for this person.</p>
              <p className="text-sm text-gray-500">Add the first transaction using the button above.</p>
            </div>
          ) : (
            <div className="payment-history-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionsWithBalance.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{moment(transaction.date).format('MMM D, YYYY')}</td>
                      <td>
                        <span className={`transaction-type ${transaction.type}`}>
                          {transaction.type === 'payment' ? 'Payment' : 'Charge'}
                        </span>
                      </td>
                      <td className={`amount ${transaction.type === 'payment' ? 'negative' : 'positive'}`}>
                        {transaction.type === 'payment' ? '-' : '+'}{formatCurrency(transaction.amount)}
                      </td>
                      <td>{transaction.description || '-'}</td>
                      <td className={`amount ${transaction.runningBalance > 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(transaction.runningBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
