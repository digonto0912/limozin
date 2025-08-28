"use client";
import { useState } from "react";
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  PencilSquareIcon,
  ClockIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import moment from "moment";
import PaymentHistoryModal from "./PaymentHistoryModal";

const ColorInfo = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="color-info-modal" onClick={onClose}>
      <div className="color-info-content" onClick={(e) => e.stopPropagation()}>
        <h3>Color Explanation</h3>
        <div className="color-info-list">
          <div className="color-info-item row-has-due">
            <span className="color-box"></span>
            <span>লাল: বাকি টাকা আছে - অতি জরুরী</span>
          </div>
          <div className="color-info-item row-expired-id">
            <span className="color-box"></span>
            <span>কমলা: আইডি কার্ডের মেয়াদ শেষ</span>
          </div>{" "}
          <div className="color-info-item row-expired-passport">
            <span className="color-box"></span>
            <span>হলুদ: পাসপোর্টের মেয়াদ শেষ</span>
          </div>
        </div>
        <button
          className="btn btn-primary btn-text-durty-center"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default function Table({
  records = [],
  onEdit,
  onDelete,
  showColorInfo = false,
  onColorInfoClose,
  highlightEnabled = true,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [paymentHistoryModal, setPaymentHistoryModal] = useState({
    isOpen: false,
    person: null,
  });

  const showHisLifeTimeTransactionHistory = (record) => {
    setPaymentHistoryModal({
      isOpen: true,
      person: record,
    });
  };

  const closePaymentHistoryModal = () => {
    setPaymentHistoryModal({
      isOpen: false,
      person: null,
    });
  };

  const columns = [
    { field: "name", label: "Name", sortable: true },
    { field: "passportExpiry", label: "Passport Expiry", sortable: true },
    { field: "idNumber", label: "ID Number", sortable: true },
    { field: "idExpiry", label: "ID Expiry", sortable: true },
    { field: "joinDate", label: "Join Date", sortable: true },
    { field: "phone", label: "Phone", sortable: true },
    { field: "dueBalance", label: "Due Balance", sortable: true },
  ];

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    try {
      // Handle different date formats
      let date;
      if (timestamp?.seconds) {
        // Firebase Timestamp
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp instanceof Date) {
        // JavaScript Date object
        date = timestamp;
      } else if (typeof timestamp === "string" && timestamp.trim() !== "") {
        // String date
        date = new Date(timestamp);
      } else {
        return "-";
      }

      return moment(date).isValid() ? moment(date).format("MMM D, YYYY") : "-";
    } catch (error) {
      console.error("Date formatting error:", error);
      return "-";
    }
  };

  // Sort records
  const getSortedRecords = () => {
    return [...records].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date fields
      if (["passportExpiry", "idExpiry", "joinDate"].includes(sortField)) {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      // Handle numeric fields
      else if (sortField === "dueBalance") {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }
      // Handle string fields
      else {
        aValue = (aValue || "").toString().toLowerCase();
        bValue = (bValue || "").toString().toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  };

  const getHighlightClass = (record) => {
    if (!highlightEnabled) return "";

    const now = new Date();
    const hasDue = record.dueBalance > 0;
    const hasExpiredId = record.idExpiry && new Date(record.idExpiry) < now;
    const hasExpiredPassport =
      record.passportExpiry && new Date(record.passportExpiry) < now;

    if (hasDue && hasExpiredId && hasExpiredPassport)
      return "row-all-conditions";
    if (hasDue && hasExpiredId) return "row-due-and-id";
    if (hasDue && hasExpiredPassport) return "row-due-and-passport";
    if (hasExpiredId && hasExpiredPassport) return "row-id-and-passport";
    if (hasDue) return "row-has-due";
    if (hasExpiredId) return "row-expired-id";
    if (hasExpiredPassport) return "row-expired-passport";

    return "";
  };

  // Filter records
  const filteredRecords = getSortedRecords().filter((record) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.name?.toLowerCase().includes(searchLower) ||
      record.idNumber?.toLowerCase().includes(searchLower) ||
      record.phone?.toLowerCase().includes(searchLower) ||
      (record.dueBalance && record.dueBalance.toString().includes(searchTerm))
    );
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const ActionButtons = ({ record }) => (
    <div className="action-buttons">
      <button
        onClick={() => showHisLifeTimeTransactionHistory(record)}
        className="history-button"
        title="View lifetime transaction history of this person"
      >
        <ClockIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => onEdit(record)}
        className="edit-button"
        title="Edit Record"
      >
        <PencilSquareIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDelete(record.id)}
        className="delete-button"
        title="Delete Record"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="table-container">
      {/* Single Search Input for both views */}
      <div className="search-container">
        <div className="search-box">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, phone, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Table View (Tablet and up) */}
      <div style={{ overflowX: "auto", width: "100%" }}>
        <table className="records-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.field}
                  onClick={() => column.sortable && handleSort(column.field)}
                  className={`${column.sortable ? "sortable" : ""} ${
                    sortField === column.field ? "sorted" : ""
                  }`}
                >
                  {column.label}
                  {column.sortable && (
                    <ChevronUpDownIcon
                      className={`sort-icon ${
                        sortField === column.field ? "active" : ""
                      }`}
                      style={{
                        transform: `translateY(-50%) ${
                          sortField === column.field && sortDirection === "desc"
                            ? "rotate(180deg)"
                            : ""
                        }`,
                      }}
                    />
                  )}
                </th>
              ))}
              <th className="action-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#6b7280",
                  }}
                >
                  No records found
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id} className={getHighlightClass(record)}>
                  <td>{record.name}</td>
                  <td>
                    <span
                      className={
                        record.passportExpiry &&
                        new Date(record.passportExpiry) < new Date()
                          ? "text-amber-600 font-medium"
                          : ""
                      }
                    >
                      {formatDate(record.passportExpiry)}
                    </span>
                  </td>
                  <td>{record.idNumber}</td>
                  <td>
                    <span
                      className={
                        record.idExpiry &&
                        new Date(record.idExpiry) < new Date()
                          ? "text-orange-600 font-medium"
                          : ""
                      }
                    >
                      {formatDate(record.idExpiry)}
                    </span>
                  </td>
                  <td>{formatDate(record.joinDate)}</td>
                  <td>{record.phone}</td>
                  <td>
                    <span
                      className={
                        record.dueBalance > 0 ? "text-red-600 font-medium" : ""
                      }
                    >
                      {record.dueBalance
                        ? " ﷼ " + record.dueBalance.toLocaleString()
                        : " ﷼ 0"}
                    </span>
                  </td>
                  <td className="action-cell">
                    <ActionButtons record={record} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-cards">
        {filteredRecords.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}
          >
            No records found
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div
              key={record.id}
              className={`record-card ${getHighlightClass(record)}`}
            >
              {columns.map((column) => (
                <div key={column.field} className="card-field">
                  <span className="field-label">{column.label}:</span>
                  <span className="field-value">
                    {column.field === "dueBalance"
                      ? record.dueBalance
                        ? " ﷼ " + record.dueBalance.toLocaleString()
                        : " ﷼ 0"
                      : ["passportExpiry", "idExpiry", "joinDate"].includes(
                          column.field
                        )
                      ? formatDate(record[column.field])
                      : record[column.field]}
                  </span>
                </div>
              ))}
              <div className="card-actions">
                <ActionButtons record={record} />
              </div>
            </div>
          ))
        )}
      </div>

      <ColorInfo isOpen={showColorInfo} onClose={onColorInfoClose} />
      
      <PaymentHistoryModal
        person={paymentHistoryModal.person}
        isOpen={paymentHistoryModal.isOpen}
        onClose={closePaymentHistoryModal}
      />
    </div>
  );
}
