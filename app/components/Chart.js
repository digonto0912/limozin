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

export default function Chart({ data = [] }) {
  const [chartType, setChartType] = useState('due');

  const getChartData = () => {
    if (chartType === 'due') {
      // Get top 10 due balances
      const sortedData = [...data]
        .filter(record => record.dueBalance > 0)
        .sort((a, b) => b.dueBalance - a.dueBalance)
        .slice(0, 10);

      return {
        labels: sortedData.map(record => record.name),
        datasets: [
          {
            label: 'Due Balance ($)',
            data: sortedData.map(record => record.dueBalance),
            backgroundColor: 'rgba(79, 70, 229, 0.8)',
            borderColor: 'rgb(79, 70, 229)',
            borderWidth: 1,
          },
        ],
      };
    } else {
      // Count of documents expiring in next 3 months
      const now = new Date();
      const threeMonths = new Date();
      threeMonths.setMonth(threeMonths.getMonth() + 3);

      const expiringPassports = data.filter(record => 
        new Date(record.passportExpiry) > now && 
        new Date(record.passportExpiry) <= threeMonths
      ).length;

      const expiringIds = data.filter(record => 
        new Date(record.idExpiry) > now && 
        new Date(record.idExpiry) <= threeMonths
      ).length;

      return {
        labels: ['Passports', 'IDs'],
        datasets: [
          {
            label: 'Documents Expiring Soon',
            data: [expiringPassports, expiringIds],
            backgroundColor: [
              'rgba(220, 38, 38, 0.8)',
              'rgba(234, 179, 8, 0.8)',
            ],
            borderColor: [
              'rgb(220, 38, 38)',
              'rgb(234, 179, 8)',
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
      },
      title: {
        display: true,
        text: chartType === 'due' ? 'Top Due Balances' : 'Documents Expiring in Next 3 Months',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (chartType === 'due') {
              return '$' + value;
            }
            return value;
          }
        }
      }
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-end">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          {chartTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setChartType(type.id)}
              className={`
                px-4 py-2 text-sm font-medium
                ${type.id === chartType
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                }
                ${type.id === 'due' ? 'rounded-l-lg' : 'rounded-r-lg'}
                border border-gray-200
                focus:z-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none
              `}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[400px]">
        <Bar data={getChartData()} options={options} />
      </div>
    </div>
  );
}
