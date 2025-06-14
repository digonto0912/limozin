'use client';
import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const chartTypes = [
  { id: 'due', name: 'Due Balance' },
  { id: 'expiry', name: 'Expiring Documents' }
];

export default function Chart({ records = [] }) {
  const [chartType, setChartType] = useState('due');

  const handleChartTypeChange = (type) => {
    setChartType(type);
  };
  const getChartData = () => {
    if (chartType === 'due') {
      // Get top 10 due balances
      const sortedData = [...records]
        .filter(record => record.dueBalance > 0)
        .sort((a, b) => b.dueBalance - a.dueBalance)
        .slice(0, 10);

      return {
        labels: sortedData.map(record => record.name),
        datasets: [
          {
            label: 'Due Balance ( ﷼ )',
            data: sortedData.map(record => record.dueBalance),
            backgroundColor: 'rgba(220, 38, 38, 0.8)', // Red for due balance
            borderColor: 'rgb(220, 38, 38)',
            borderWidth: 1,
          },
        ],
      };
    } else {
      // Get expired and expiring documents counts
      const now = new Date();
      
      // Count expired documents
      const expiredPassports = records.filter(record => 
        record.passportExpiry && new Date(record.passportExpiry) < now
      ).length;

      const expiredIds = records.filter(record => 
        record.idExpiry && new Date(record.idExpiry) < now
      ).length;

      // Count documents expiring in next 30 days
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);

      const expiringPassports = records.filter(record => 
        record.passportExpiry &&
        new Date(record.passportExpiry) >= now && 
        new Date(record.passportExpiry) <= thirtyDays
      ).length;

      const expiringIds = records.filter(record => 
        record.idExpiry &&
        new Date(record.idExpiry) >= now && 
        new Date(record.idExpiry) <= thirtyDays
      ).length;      return {
        labels: ['Expired Passports', 'Expiring Passports', 'Expired IDs', 'Expiring IDs'],
        datasets: [
          {
            label: 'Document Status',
            data: [expiredPassports, expiringPassports, expiredIds, expiringIds],
            backgroundColor: [
              'rgba(234, 179, 8, 0.8)',    // Yellow for expired passports
              'rgba(234, 179, 8, 0.4)',    // Light yellow for expiring passports
              'rgba(249, 115, 22, 0.8)',   // Orange for expired IDs
              'rgba(249, 115, 22, 0.4)',   // Light orange for expiring IDs
            ],
            borderColor: [
              'rgb(234, 179, 8)',    // Yellow
              'rgb(234, 179, 8)',    // Yellow
              'rgb(249, 115, 22)',   // Orange
              'rgb(249, 115, 22)',   // Orange
            ],
            borderWidth: 1,
          },
        ],
      };
    }
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: false, // Hide legend since we use different colors for statuses
      },
      title: {
        display: true,
        text: chartType === 'due' ? 'Top Due Balances' : 'Document Status Overview',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (chartType === 'due') {
              return ' ﷼  ' + context.raw.toLocaleString();
            }
            return context.raw + ' records';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (chartType === 'due') {
              return ' ﷼  ' + value.toLocaleString();
            }
            return value;
          }
        }
      }
    }
  };
  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
        <div className="chart-buttons" role="group">
          {chartTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setChartType(type.id)}
              className={`chart-button ${type.id === chartType ? 'active' : ''}`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: '400px' }}>
        <Bar data={getChartData()} options={options} />
      </div>
    </div>
  );
}
