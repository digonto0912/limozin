'use client';
import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function AddEditModal({ isOpen, onClose, onSave, record = null }) {
  const [formData, setFormData] = useState({
    name: '',
    passportExpiry: '',
    idNumber: '',
    idExpiry: '',
    joinDate: '',
    phone: '',
    dueBalance: '',
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
    } else {
      setFormData({
        name: '',
        passportExpiry: '',
        idNumber: '',
        idExpiry: '',
        joinDate: '',
        phone: '',
        dueBalance: '',
      });
    }
    setErrors({});
  }, [record, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.idNumber?.trim()) newErrors.idNumber = 'ID Number is required';
    if (!formData.idExpiry) newErrors.idExpiry = 'ID Expiry date is required';
    if (!formData.joinDate) newErrors.joinDate = 'Join Date is required';
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (formData.dueBalance && isNaN(formData.dueBalance)) {
      newErrors.dueBalance = 'Due Balance must be a number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        dueBalance: formData.dueBalance ? parseFloat(formData.dueBalance) : 0,
        id: record?.id,
      });
      onClose();
    } catch (error) {
      console.error('Error saving record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      {record ? 'Edit Record' : 'Add New Record'}
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                              errors.name ? 'border-red-300' : ''
                            }`}
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone
                          </label>
                          <input
                            type="text"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                              errors.phone ? 'border-red-300' : ''
                            }`}
                          />
                          {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700">
                            ID Number
                          </label>
                          <input
                            type="text"
                            name="idNumber"
                            id="idNumber"
                            value={formData.idNumber}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                              errors.idNumber ? 'border-red-300' : ''
                            }`}
                          />
                          {errors.idNumber && (
                            <p className="mt-1 text-sm text-red-600">{errors.idNumber}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="idExpiry" className="block text-sm font-medium text-gray-700">
                            ID Expiry
                          </label>
                          <input
                            type="date"
                            name="idExpiry"
                            id="idExpiry"
                            value={formData.idExpiry}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                              errors.idExpiry ? 'border-red-300' : ''
                            }`}
                          />
                          {errors.idExpiry && (
                            <p className="mt-1 text-sm text-red-600">{errors.idExpiry}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="passportExpiry" className="block text-sm font-medium text-gray-700">
                            Passport Expiry
                          </label>
                          <input
                            type="date"
                            name="passportExpiry"
                            id="passportExpiry"
                            value={formData.passportExpiry}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700">
                            Join Date
                          </label>
                          <input
                            type="date"
                            name="joinDate"
                            id="joinDate"
                            value={formData.joinDate}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                              errors.joinDate ? 'border-red-300' : ''
                            }`}
                          />
                          {errors.joinDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.joinDate}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="dueBalance" className="block text-sm font-medium text-gray-700">
                            Due Balance
                          </label>
                          <div className="relative mt-1 rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                              type="text"
                              name="dueBalance"
                              id="dueBalance"
                              value={formData.dueBalance}
                              onChange={handleChange}
                              className={`block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                errors.dueBalance ? 'border-red-300' : ''
                              }`}
                              placeholder="0.00"
                            />
                          </div>
                          {errors.dueBalance && (
                            <p className="mt-1 text-sm text-red-600">{errors.dueBalance}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
