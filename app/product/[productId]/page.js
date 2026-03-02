"use client";
import { useState, useEffect } from "react";
import { useParams, redirect } from "next/navigation";
import {
  InformationCircleIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  SwatchIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import Chart from "../../components/Chart";
import Table from "../../components/Table";
import AddEditModal from "../../components/AddEditModal";
import Loading from "../../components/Loading";
import Header from "../../components/Header";
import ProtectedRoute from "../../components/ProtectedRoute";
import RoleBasedContent from "../../components/RoleBasedContent";
import { useAuth } from "../../contexts/AuthContext";
import { getProductById, isValidProduct } from "../../config/products";

export default function ProductDashboard() {
  const params = useParams();
  const productId = params.productId;
  const product = getProductById(productId);

  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showColorInfo, setShowColorInfo] = useState(false);
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadPin] = useState("1234");
  const validProduct = isValidProduct(productId);

  useEffect(() => {
    if (validProduct && user && user.email) {
      fetchRecords();
    } else if (!validProduct) {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [user, productId, validProduct]);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError("Loading timeout. Please refresh the page.");
      }
    }, 15000);
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Validate product ID - must come after all hooks
  if (!validProduct) {
    redirect("/product/save-way-limousine");
    return null;
  }

  const showNotification = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const fetchRecords = async (retryCount = 0) => {
    if (!user || !user.email) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch(`/api/records?product=${productId}`, {
        headers: {
          "x-user-email": user.email,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          setRecords([]);
          setIsLoading(false);
          return;
        }

        if (response.status === 401 && retryCount < 2) {
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
        const response = await fetch(`/api/record/${id}?product=${productId}`, {
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
      const originalRecord = formData.id
        ? records.find((r) => r.id === formData.id)
        : null;
      const originalDueBalance = originalRecord
        ? originalRecord.dueBalance || 0
        : 0;
      const newDueBalance = formData.dueBalance || 0;

      const url = formData.id
        ? `/api/record/${formData.id}?product=${productId}`
        : `/api/record?product=${productId}`;
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

      const savedRecord = await response.json();
      const recordId = formData.id || savedRecord.id;

      // Create payment history entry for both new and edited records with due balance
      if (newDueBalance > 0) {
        if (formData.id) {
          if (originalDueBalance !== newDueBalance) {
            const balanceChange = newDueBalance - originalDueBalance;
            try {
              await fetch(`/api/payment-history?product=${productId}`, {
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
            } catch (historyError) {
              console.error("Failed to update payment history:", historyError);
            }
          }
        } else {
          try {
            await fetch(`/api/payment-history?product=${productId}`, {
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

  const fetchAllPaymentHistory = async () => {
    const allPaymentHistory = {};
    for (const record of records) {
      try {
        const response = await fetch(
          `/api/payment-history?personId=${record.id}&product=${productId}`,
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
      return "-";
    }
  };

  const convertToCSV = (records, paymentHistories) => {
    const csvRows = [];
    const mainHeaders = [
      "Record ID", "Name", "Passport Number", "Passport Expiry",
      "ID Number", "ID Expiry", "Join Date", "Phone",
      "Due Balance", "Notes", "Created At", "Updated At",
    ];
    const paymentHeaders = [
      "Payment ID", "Payment Date", "Payment Type",
      "Payment Amount", "Payment Description", "Person Name",
    ];

    csvRows.push(`PRODUCT: ${product.name}`);
    csvRows.push("MAIN RECORDS");
    csvRows.push(mainHeaders.join(","));

    records.forEach((record) => {
      const row = [
        record.id || "",
        `"${(record.name || "").replace(/"/g, '""')}"`,
        record.passportNumber || "",
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

    csvRows.push("");
    csvRows.push("PAYMENT HISTORY");
    csvRows.push(paymentHeaders.join(","));

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
        `${product.shortName.toLowerCase()}_data_${new Date().toISOString().split("T")[0]}.csv`
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

  const downloadJSON = async () => {
    try {
      const paymentHistories = await fetchAllPaymentHistory();
      const data = {
        product: product.name,
        productId: productId,
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
        `${product.shortName.toLowerCase()}_data_${new Date().toISOString().split("T")[0]}.json`
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

  const verifyPinForDownload = () => {
    const enteredPin = window.prompt(
      "Enter PIN to download data:\n\n" +
        "🔒 This action requires authentication to protect sensitive information."
    );
    if (enteredPin === null) return false;
    if (enteredPin !== downloadPin) {
      showNotification("Invalid PIN. Access denied.", "error");
      return false;
    }
    return true;
  };

  const handleDownload = async () => {
    if (records.length === 0) {
      showNotification(
        "No data to export. Please add some records first.",
        "error"
      );
      return;
    }

    if (!verifyPinForDownload()) return;

    setIsDownloading(true);
    try {
      const choice = window.confirm(
        "Choose download format:\n\n" +
          "OK = Download both CSV and JSON files\n" +
          "Cancel = Show format selection"
      );

      if (choice) {
        await downloadCSV();
        await downloadJSON();
        showNotification("Files downloaded successfully!");
      } else {
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

  const handleEmergencyBypass = () => {
    setIsLoading(false);
    setError(null);
    if (user && user.email) {
      fetchRecords();
    }
  };

  if (isLoading && records.length === 0) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading {product.name}...</p>
          {process.env.NODE_ENV === "production" && (
            <button
              onClick={handleEmergencyBypass}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                background: "#ff6b6b",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Emergency Bypass (Click if stuck)
            </button>
          )}
        </div>
      </div>
    );
  }

  const filteredRecords = getFilteredRecords();

  return (
    <ProtectedRoute>
      <div>
        <Header productId={productId} />
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
              <div className="card-header">
                <h2>Records</h2>
                <div className="card-header-actions">
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
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    <span className="btn-text">{isDownloading ? "Downloading..." : "Download Data"}</span>
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
                  >
                    {highlightEnabled ? (
                      <NoSymbolIcon className="w-5 h-5" />
                    ) : (
                      <SwatchIcon className="w-5 h-5" />
                    )}
                    <span className="btn-text">
                      {highlightEnabled ? "Stop highlighting" : "Start highlighting"}
                    </span>
                  </button>
                  <button
                    className="btn btn-light"
                    onClick={() => setShowColorInfo(true)}
                    title="Color Info"
                  >
                    <InformationCircleIcon className="w-5 h-5" />
                    <span className="btn-text">Color Info</span>
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddRecord}
                    title="Add New Record"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span className="btn-text">Add New Record</span>
                  </button>
                </div>
              </div>
              <Table
                records={filteredRecords}
                onEdit={handleEditRecord}
                onDelete={handleDeleteRecord}
                showColorInfo={showColorInfo}
                onColorInfoClose={() => setShowColorInfo(false)}
                highlightEnabled={highlightEnabled}
                productId={productId}
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
