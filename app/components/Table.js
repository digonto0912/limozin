'use client';
import { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  ChevronUpDownIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import moment from 'moment';

export default function Table({ records = [], onEdit, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const filteredData = records.filter(record =>
    record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.phone?.includes(searchTerm) ||
    record.idNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(record.dueBalance || 0).includes(searchTerm)
  ).sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    return sortDirection === 'asc' ? 
      aValue.localeCompare(bValue) : 
      bValue.localeCompare(aValue);
  });

  const getRowClass = (record) => {
    const now = moment();
    if (moment(record.passportExpiry).isBefore(now)) return 'bg-red-50 hover:bg-red-100';
    if (moment(record.idExpiry).isBefore(now)) return 'bg-yellow-50 hover:bg-yellow-100';
    if (record.dueBalance > 0) return 'bg-blue-50 hover:bg-blue-100';
    return 'hover:bg-gray-50';
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field) => {
    return (
      <ChevronUpDownIcon
        className={`h-5 w-5 text-gray-400 ml-2 ${
          sortField === field ? 'text-gray-700' : ''
        }`}
        aria-hidden="true"
      />
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      {/* Search */}
      <div className="pb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Records ({filteredData.length})
        </h2>
        <div className="relative w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      <button
                        onClick={() => handleSort('name')}
                        className="group inline-flex items-center"
                      >
                        Name
                        {renderSortIcon('name')}
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      <button
                        onClick={() => handleSort('idNumber')}
                        className="group inline-flex items-center"
                      >
                        ID Number
                        {renderSortIcon('idNumber')}
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      <button
                        onClick={() => handleSort('idExpiry')}
                        className="group inline-flex items-center"
                      >
                        ID Expiry
                        {renderSortIcon('idExpiry')}
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      <button
                        onClick={() => handleSort('passportExpiry')}
                        className="group inline-flex items-center"
                      >
                        Passport Expiry
                        {renderSortIcon('passportExpiry')}
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      <button
                        onClick={() => handleSort('joinDate')}
                        className="group inline-flex items-center"
                      >
                        Join Date
                        {renderSortIcon('joinDate')}
                      </button>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      <button
                        onClick={() => handleSort('dueBalance')}
                        className="group inline-flex items-center"
                      >
                        Due Balance
                        {renderSortIcon('dueBalance')}
                      </button>
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-3 py-4 text-sm text-center text-gray-500">
                        {isLoading ? (
                          <div className="flex justify-center items-center space-x-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                            <span>Loading records...</span>
                          </div>
                        ) : searchTerm ? (
                          'No records found matching your search.'
                        ) : (
                          'No records available.'
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((record) => (
                      <tr key={record.id} className={getRowClass(record)}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {record.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{record.idNumber}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {moment(record.idExpiry).format('MMM D, YYYY')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {moment(record.passportExpiry).format('MMM D, YYYY')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {moment(record.joinDate).format('MMM D, YYYY')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{record.phone}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          ${record.dueBalance?.toFixed(2) || '0.00'}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => onEdit(record)}
                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-x-1.5"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
