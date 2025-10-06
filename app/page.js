"use client";
import { useState, useEffect } from "react";
import {
  InformationCircleIcon,
  SwatchIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import Chart from "./components/Chart";
import Table from "./components/Table";
import AddEditModal from "./components/AddEditModal";
import Loading from "./components/Loading";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedContent from "./components/RoleBasedContent";
import { useAuth } from "./contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'due', 'expiring'
  const [showColorInfo, setShowColorInfo] = useState(false);
  const [highlightEnabled, setHighlightEnabled] = useState(true); // Add highlight toggle state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadPin] = useState("1234"); // Default PIN - you can change this

  useEffect(() => {
    // Only fetch records when user is authenticated
    if (user && user.email) {
      fetchRecords();
    }
  }, [user]);

  const showNotification = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const fetchRecords = async (retryCount = 0) => {
    // Don't fetch if user is not authenticated
    if (!user || !user.email) {
      console.log("User not authenticated, skipping records fetch");
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      const response = await fetch("/api/records", {
        headers: {
          "x-user-email": user.email,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          // This is expected for regular users - don't log as error
          console.log(
            "User has insufficient permissions for records access (this is normal for regular users)"
          );
          setRecords([]);
          setIsLoading(false);
          return;
        }

        let errorData = {};
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.log("Could not parse error response as JSON");
        }

        console.error("API Error:", errorData);

        if (response.status === 401 && retryCount < 2) {
          // Retry after a short delay for user creation to complete
          console.log(
            `Authentication failed, retrying in 1 second (attempt ${
              retryCount + 1
            })`
          );
          setTimeout(() => fetchRecords(retryCount + 1), 1000);
          return;
        } else if (response.status === 401) {
          throw new Error("Authentication required. Please log in again.");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error("Error fetching records:", error);
      if (error.message.includes("Insufficient permissions")) {
        // Don't show error notification for permission issues
        setRecords([]);
      } else {
        showNotification(error.message, "error");
        setRecords([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredRecords = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    switch (activeFilter) {
      case "due":
        return records.filter((record) => record.dueBalance > 0);
      case "expiring":
        return records.filter((record) => {
          const passportExpiry = record.passportExpiry
            ? new Date(record.passportExpiry)
            : null;
          const idExpiry = record.idExpiry ? new Date(record.idExpiry) : null;

          return (
            (passportExpiry && passportExpiry <= thirtyDaysFromNow) ||
            (idExpiry && idExpiry <= thirtyDaysFromNow)
          );
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
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const response = await fetch(`/api/record/${id}`, {
          method: "DELETE",
          headers: {
            "x-user-email": user?.email || "",
          },
        });
        if (response.ok) {
          showNotification("Record deleted successfully");
          fetchRecords();
        } else {
          throw new Error("Failed to delete record");
        }
      } catch (error) {
        showNotification("Failed to delete record", "error");
      }
    }
  };

  const handleSaveRecord = async (formData) => {
    try {
      // Get the original record to compare due balance changes
      const originalRecord = formData.id
        ? records.find((r) => r.id === formData.id)
        : null;
      const originalDueBalance = originalRecord
        ? originalRecord.dueBalance || 0
        : 0;
      const newDueBalance = formData.dueBalance || 0;

      const url = formData.id ? `/api/record/${formData.id}` : "/api/record";
      const method = formData.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user?.email || "",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save record");
      }

      // Get the saved record data to get the ID for new records
      const savedRecord = await response.json();
      const recordId = formData.id || savedRecord.id;

      // Create payment history entry for both new and edited records with due balance
      if (newDueBalance > 0) {
        if (formData.id) {
          // Editing existing record - only if balance changed
          if (originalDueBalance !== newDueBalance) {
            const balanceChange = newDueBalance - originalDueBalance;

            try {
              await fetch("/api/payment-history", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-user-email": user?.email || "",
                },
                body: JSON.stringify({
                  personId: recordId,
                  personName: formData.name,
                  amount: Math.abs(balanceChange),
                  type: balanceChange > 0 ? "charge" : "payment",
                  description:
                    balanceChange > 0
                      ? `Due balance increased from ﷼${originalDueBalance.toLocaleString()} to ﷼${newDueBalance.toLocaleString()}`
                      : `Due balance decreased from ﷼${originalDueBalance.toLocaleString()} to ﷼${newDueBalance.toLocaleString()}`,
                  date: new Date().toISOString(),
                }),
              });
              console.log("Payment history updated automatically for edit");
            } catch (historyError) {
              console.error("Failed to update payment history:", historyError);
            }
          }
        } else {
          // Adding new record with due balance - create initial charge entry
          try {
            await fetch("/api/payment-history", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-user-email": user?.email || "",
              },
              body: JSON.stringify({
                personId: recordId,
                personName: formData.name,
                amount: newDueBalance,
                type: "charge",
                description: `Initial due balance of ﷼${newDueBalance.toLocaleString()} set when record was created`,
                date: new Date().toISOString(),
              }),
            });
            console.log("Payment history created automatically for new record");
          } catch (historyError) {
            console.error(
              "Failed to create initial payment history:",
              historyError
            );
          }
        }
      }

      showNotification(
        formData.id
          ? "Record updated successfully"
          : "Record added successfully"
      );
      handleCloseModal();
      fetchRecords();
    } catch (error) {
      console.error("Error saving record:", error);
      showNotification("Failed to save record", "error");
    }
  };

  // Function to fetch all payment history for all records
  const fetchAllPaymentHistory = async () => {
    const allPaymentHistory = {};

    for (const record of records) {
      try {
        const response = await fetch(
          `/api/payment-history?personId=${record.id}`,
          {
            headers: {
              "x-user-email": user?.email || "",
            },
          }
        );
        if (response.ok) {
          const paymentHistory = await response.json();
          allPaymentHistory[record.id] = paymentHistory;
        } else {
          allPaymentHistory[record.id] = [];
        }
      } catch (error) {
        console.error(
          `Failed to fetch payment history for ${record.name}:`,
          error
        );
        allPaymentHistory[record.id] = [];
      }
    }

    return allPaymentHistory;
  };

  // Function to format date consistently
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    try {
      let date;
      if (timestamp?.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === "string" && timestamp.trim() !== "") {
        date = new Date(timestamp);
      } else {
        return "-";
      }
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Date formatting error:", error);
      return "-";
    }
  };

  // Function to convert data to CSV format
  const convertToCSV = (records, paymentHistories) => {
    const csvRows = [];

    // CSV Headers for main records
    const mainHeaders = [
      "Record ID",
      "Name",
      "Passport Expiry",
      "ID Number",
      "ID Expiry",
      "Join Date",
      "Phone",
      "Due Balance",
      "Notes",
      "Created At",
      "Updated At",
    ];

    // CSV Headers for payment history
    const paymentHeaders = [
      "Payment ID",
      "Payment Date",
      "Payment Type",
      "Payment Amount",
      "Payment Description",
      "Person Name",
    ];

    // Add main records section
    csvRows.push("MAIN RECORDS");
    csvRows.push(mainHeaders.join(","));

    records.forEach((record) => {
      const row = [
        record.id || "",
        `"${(record.name || "").replace(/"/g, '""')}"`,
        formatDate(record.passportExpiry) || "",
        record.idNumber || "",
        formatDate(record.idExpiry) || "",
        formatDate(record.joinDate) || "",
        record.phone || "",
        record.dueBalance || 0,
        `"${(record.notes || "").replace(/"/g, '""')}"`,
        record.createdAt || "",
        record.updatedAt || "",
      ];
      csvRows.push(row.join(","));
    });

    // Add empty line separator
    csvRows.push("");
    csvRows.push("PAYMENT HISTORY");
    csvRows.push(paymentHeaders.join(","));

    // Add payment history for each person
    Object.entries(paymentHistories).forEach(([personId, payments]) => {
      const person = records.find((r) => r.id === personId);
      payments.forEach((payment) => {
        const row = [
          payment.id || "",
          payment.date || "",
          payment.type || "",
          payment.amount || 0,
          `"${(payment.description || "").replace(/"/g, '""')}"`,
          `"${(person?.name || "").replace(/"/g, '""')}"`,
        ];
        csvRows.push(row.join(","));
      });
    });

    return csvRows.join("\n");
  };

  // Function to download CSV
  const downloadCSV = async () => {
    try {
      const paymentHistories = await fetchAllPaymentHistory();
      const csvContent = convertToCSV(records, paymentHistories);

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `limozin_data_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download CSV:", error);
      throw error;
    }
  };

  // Function to download JSON
  const downloadJSON = async () => {
    try {
      const paymentHistories = await fetchAllPaymentHistory();

      const data = {
        exportDate: new Date().toISOString(),
        totalRecords: records.length,
        records: records.map((record) => ({
          ...record,
          paymentHistory: paymentHistories[record.id] || [],
        })),
        summary: {
          totalDueBalance: records.reduce(
            (sum, record) => sum + (record.dueBalance || 0),
            0
          ),
          expiredPassports: records.filter(
            (r) => r.passportExpiry && new Date(r.passportExpiry) < new Date()
          ).length,
          expiredIds: records.filter(
            (r) => r.idExpiry && new Date(r.idExpiry) < new Date()
          ).length,
          totalPaymentTransactions: Object.values(paymentHistories).reduce(
            (sum, payments) => sum + payments.length,
            0
          ),
        },
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `limozin_data_${new Date().toISOString().split("T")[0]}.json`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download JSON:", error);
      throw error;
    }
  };

  // Function to verify PIN before download
  const verifyPinForDownload = () => {
    const enteredPin = window.prompt(
      "Enter PIN to download data:\n\n" +
        "🔒 This action requires authentication to protect sensitive information."
    );

    if (enteredPin === null) {
      // User cancelled
      return false;
    }

    if (enteredPin !== downloadPin) {
      showNotification("Invalid PIN. Access denied.", "error");
      return false;
    }

    return true;
  };

  // Function to handle download button click
  const handleDownload = async () => {
    if (records.length === 0) {
      showNotification(
        "No data to export. Please add some records first.",
        "error"
      );
      return;
    }

    // Verify PIN before proceeding
    if (!verifyPinForDownload()) {
      return;
    }

    setIsDownloading(true);

    try {
      const choice = window.confirm(
        "Choose download format:\n\n" +
          "OK = Download both CSV and JSON files\n" +
          "Cancel = Show format selection"
      );

      if (choice) {
        // Download both formats
        await downloadCSV();
        await downloadJSON();
        showNotification("Files downloaded successfully!");
      } else {
        // Show format selection
        const format = window.prompt(
          "Choose format to download:\n\n" +
            "1 = CSV only\n" +
            "2 = JSON only\n" +
            "3 = Both formats\n\n" +
            "Enter number (1, 2, or 3):"
        );

        switch (format) {
          case "1":
            await downloadCSV();
            showNotification("CSV file downloaded successfully!");
            break;
          case "2":
            await downloadJSON();
            showNotification("JSON file downloaded successfully!");
            break;
          case "3":
            await downloadCSV();
            await downloadJSON();
            showNotification("Files downloaded successfully!");
            break;
          case null:
            // User cancelled
            break;
          default:
            showNotification("Invalid selection. Please try again.", "error");
        }
      }
    } catch (error) {
      console.error("Download failed:", error);
      showNotification(
        "Failed to download files. Please check your internet connection and try again.",
        "error"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading && records.length === 0) {
    return <Loading />;
  }

  const filteredRecords = getFilteredRecords();

  return (
    <ProtectedRoute>
      <div>
        <Header />
        <RoleBasedContent>
          <main className="main-content">
            <div className="dashboard-grid">
              <div className="stat-card">
                <h3>Total Records</h3>
                <div className="value">{records.length}</div>
              </div>
              <div className="stat-card">
                <h3>Expired Passports</h3>
                <div className="value">
                  {
                    records.filter(
                      (r) => new Date(r.passportExpiry) < new Date()
                    ).length
                  }
                </div>
              </div>
              <div className="stat-card">
                <h3>Expired IDs</h3>
                <div className="value">
                  {
                    records.filter((r) => new Date(r.idExpiry) < new Date())
                      .length
                  }
                </div>
              </div>
              <div className="stat-card">
                <h3>Total Due Balance</h3>
                <div className="value">
                  ﷼{" "}
                  {records
                    .reduce((sum, r) => sum + (r.dueBalance || 0), 0)
                    .toLocaleString()}
                </div>
              </div>
            </div>

            <div className="card chart-container">
              <Chart records={filteredRecords} />
            </div>

            <div className="card">
              {" "}
              <div className="card-header">
                <h2>Records</h2>{" "}
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "center",
                  }}
                >
                  <button
                    className={`btn btn-light ${
                      isDownloading || records.length === 0 ? "opacity-50" : ""
                    }`}
                    onClick={handleDownload}
                    disabled={isDownloading || records.length === 0}
                    title={
                      records.length === 0
                        ? "No data to download"
                        : isDownloading
                        ? "Downloading..."
                        : "Download all data as CSV and JSON files"
                    }
                    style={{ height: "38px" }}
                  >
                    <img
                      src="/file.png"
                      alt="Download"
                      className="w-5 h-5 mr-2"
                    />
                    {isDownloading ? "Downloading..." : "Download Data"}
                  </button>
                  <button
                    className={`btn btn-light ${
                      !highlightEnabled ? "btn-light-active" : ""
                    }`}
                    onClick={() => setHighlightEnabled(!highlightEnabled)}
                    title={
                      highlightEnabled
                        ? "Turn off highlighting"
                        : "Turn on highlighting"
                    }
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "38px",
                    }}
                  >
                    <img
                      src={highlightEnabled ? "/stop.png" : "/color.png"}
                      alt="Highlight"
                      className="w-5 h-5"
                    />
                    {highlightEnabled
                      ? "Stop highlighting"
                      : "Start highlighting"}
                  </button>
                  <button
                    className="btn btn-light"
                    onClick={() => setShowColorInfo(true)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      height: "38px",
                    }}
                  >
                    <InformationCircleIcon className="w-5 h-5" />
                    <span>Color Info</span>
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddRecord}
                    style={{ height: "38px" }}
                  >
                    <img
                      src="/add-icon.png"
                      alt="Download"
                      style={{ filter: "invert(100%)" }}
                      className="w-5 h-5 mr-2"
                    />
                    Add New Record
                  </button>
                </div>
              </div>{" "}
              <Table
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
                {toastType === "success" ? "✅" : "❌"} {toastMessage}
              </div>
            )}
          </main>
        </RoleBasedContent>
      </div>
    </ProtectedRoute>
  );
}
