'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import moment from 'moment';

export default function PaymentHistoryModal({ person, isOpen, onClose }) {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState({});

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

  const formatCurrency = (amount) => {
    return ` ﷼ ${Math.abs(amount).toLocaleString()}`;
  };

  const formatDateWithTime = (dateString) => {
    return moment(dateString).format('MMM D, YYYY h:mm A');
  };

  const toggleDetails = (transactionId) => {
    setExpandedDetails(prev => ({
      ...prev,
      [transactionId]: !prev[transactionId]
    }));
  };

  const calculateRunningBalance = () => {
    // Sort transactions by date (oldest first) to calculate running balance correctly
    const sortedTransactions = [...paymentHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let balance = 0;
    const transactionsWithBalance = sortedTransactions.map(transaction => {
      if (transaction.type === 'payment') {
        balance -= transaction.amount;
      } else {
        balance += transaction.amount;
      }
      return { ...transaction, runningBalance: balance };
    });
    
    // Return sorted by newest first for display
    return transactionsWithBalance.reverse();
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

        <div className="payment-info-note">
          <p style={{ 
            padding: '0.75rem', 
            backgroundColor: '#f0f9ff', 
            border: '1px solid #0ea5e9', 
            borderRadius: '6px', 
            margin: '1rem',
            fontSize: '0.875rem',
            color: '#0369a1'
          }}>
            📝 <strong>Note:</strong> Payment history is automatically updated when you edit the due balance in the Edit Record modal. 
            Increase in due balance = charge, decrease = payment received.
          </p>
        </div>

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
              <p className="text-sm text-gray-500">Payment history will be automatically created when you edit the due balance.</p>
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
                      <td style={{ fontSize: '0.875rem' }}>
                        <div>{formatDateWithTime(transaction.date)}</div>
                      </td>
                      <td>
                        <span className={`transaction-type ${transaction.type}`}>
                          {transaction.type === 'payment' ? 'Payment' : 'Charge'}
                        </span>
                      </td>
                      <td className={`amount ${transaction.type === 'payment' ? 'negative' : 'positive'}`}>
                        {transaction.type === 'payment' ? '-' : '+'}{formatCurrency(transaction.amount)}
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        <div>
                          {expandedDetails[transaction.id] && (
                            <div style={{ marginBottom: '4px', fontSize: '0.875rem' }}>
                              {transaction.description || '-'}
                            </div>
                          )}
                          <button
                            onClick={() => toggleDetails(transaction.id)}
                            style={{
                              background: 'none',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                              padding: '2px 8px',
                              color: '#374151',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              backgroundColor: '#f9fafb'
                            }}
                          >
                            {expandedDetails[transaction.id] ? 'Hide Details' : 'Show Details'}
                          </button>
                        </div>
                      </td>
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
