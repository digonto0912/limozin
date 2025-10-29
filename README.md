# 📘 Business Monitoring ERP — Full System Documentation

> A minimal ERP-style system for tracking employee/customer documents and payment dues. Designed for a single business owner who needs clarity and peace of mind about ongoing records.

---

## 🧠 1. Purpose

This system is designed to **reduce mental burden** for a business owner (your uncle) who currently remembers everything manually—from payment collections to document expiry tracking.

It will:

* Track important data (e.g., passport/ID expiry dates, payment dues)
* Highlight issues (like expired passports or unpaid dues)
* Display a clean **dashboard** with charts and tables for quick insights

---

## 💻 2. Tech Stack

| Layer         | Technology                               |
| ------------- | ---------------------------------------- |
| Frontend      | Next.js + Tailwind CSS                   |
| Chart Library | Chart.js / Recharts                      |
| Backend API   | Node.js + Express.js                     |
| Database      | Firebase Firestore                       |
| Hosting       | Vercel (for Next.js) |

---

## 🔐 3. Authentication

* ❌ No login system required initially
* Future option: Firebase Auth (admin-only access)

---

## 📂 4. Folder Structure (Recommendation)

```
erp-monitoring-app/
├── backend/
│   ├── server.js
│   ├── routes/
│   │   └── records.js
│   └── firebase/
│       └── firestore.js
├── frontend/
│   ├── pages/
│   │   └── index.tsx
│   ├── components/
│   │   ├── Table.tsx
│   │   ├── Chart.tsx
│   │   └── AddEditModal.tsx
│   ├── styles/
│   │   └── globals.css
│   └── utils/
│       └── api.ts
├── README.md
└── package.json
```

---

## 📊 5. Dashboard (UI)

### 5.1 Chart Summary (Top Section)

* Bar or Pie Chart displaying:

  * 🔴 Expired Passports
  * 🟠 Expired IDs
  * 🟡 Total Due Amount
  * 🟢 Total Records

### 5.2 Record Table (Below Chart)

| Name | Passport No. | Passport Expiry | ID No. | ID Expiry | Join Date | Phone | Due Balance | Notes |
| ---- | ------------ | --------------- | ------ | --------- | --------- | ----- | ----------- | ----- |

#### Features:

* Search/filter by name, phone, expiry, dues
* Row highlighting:

  * 🔴 Red for due balance
  * 🟠 Orange for expired ID
  * 💛 Yellow for expired passport
* Row Actions:

  * 🖊️ Edit
  * ❌ Delete
  * ➕ Add (Modal)

---

## 🔁 6. Backend API (Node.js + Express)

### Base URL

```
front-end: http://localhost:3001/api
backend-end: http://localhost:3002/api
```

### Routes

| Method | Endpoint      | Description            |
| ------ | ------------- | ---------------------- |
| GET    | `/records`    | Get all records        |
| POST   | `/record`     | Create new record      |
| PUT    | `/record/:id` | Update existing record |
| DELETE | `/record/:id` | Delete a record        |

---

## 🔌 7. Firebase Firestore (Database)

### Collection: `records`

#### Example Document:

```json
{
  "name": "Rahim Uddin",
  "passportNumber": "A1234567",
  "passportExpiry": "2025-11-10",
  "idNumber": "1234567890",
  "idExpiry": "2026-03-15",
  "joinDate": "2022-06-12",
  "phone": "017xxxxxxxx",
  "dueBalance": 15000,
  "notes": "Delayed payment",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## 🧰 8. Frontend (Next.js)

### `/` (Dashboard)

* Loads data from the backend
* Displays:

  * `<Chart />` summary
  * `<Table />` with actions
  * `<AddEditModal />` form

---

## 🧱 9. Components (Frontend)

### `<Chart />`

* Visualizes:

  * Expired passports/IDs
  * Total dues
  * Record count

### `<Table />`

* Displays records
* Highlights rows
* Includes edit/delete

### `<AddEditModal />`

* Reusable form for Add/Edit
* Fields:

  * Name, Passport Expiry, ID Number, ID Expiry, Join Date, Phone, Due Balance, Notes

---

## 🔄 10. Data Flow

1. Dashboard loads: calls `GET /records`
2. Chart computes summaries
3. Table renders data
4. Add/Edit/Delete use modal form
5. Backend updates Firestore
6. Frontend refreshes data

---

## 📦 11. Deployment

* **Frontend**: Vercel or Firebase Hosting
* **Backend**: Firebase Cloud Functions or Render
* **Database**: Firebase Firestore (free tier is sufficient)

---

## 🛠️ 12. Future Enhancements

* **Authentication System**: Complete login/signup functionality with user roles (Admin, Staff)
* **History Tracker**: Audit log system to track which user made which changes in the database (who added/edited/deleted records and when)
* **Data Backup & Recovery**: Automated backup system and data recovery options
* **Advanced Analytics**: More detailed reporting with filters and date ranges
* **Export to Excel/CSV**: Download data in various formats
* **Notification System**: Email/SMS reminders for expiring documents and due payments
* **Mobile Application**: React Native app for mobile access
* **Multi-language Support**: Support for local languages
* **Role-based Permissions**: Different access levels for different user types
* **Document Upload**: Ability to attach scanned documents/photos to records

---

## ✅ 13. Dev Checklist

* [ ] Setup Firebase Firestore project
* [ ] Configure Node.js backend and API
* [ ] Build Next.js frontend (Chart + Table)
* [ ] Test Add/Edit/Delete workflows
* [ ] Implement row highlights
* [ ] Ensure chart auto-updates
* [ ] Deploy to hosting

---

## 📋 14. Example Data (For Seeding)

| Name        | Passport No. | Passport Expiry | ID No.     | ID Expiry  | Join Date  | Phone       | Due Balance | Notes           |
| ----------- | ------------ | --------------- | ---------- | ---------- | ---------- | ----------- | ----------- | --------------- |
| Rahim Uddin | A1234567     | 2025-11-10      | 1234567890 | 2026-03-15 | 2022-06-12 | 01712345678 | 15000       | Delayed payment |
| Karim Ali   | B7654321     | 2024-07-01      | 9876543210 | 2024-09-12 | 2021-03-22 | 01876543210 | 0           | All good        |

---

## 📟 15. Input System (Add/Edit Record)

### 📌 Purpose

Let the admin:

* Add new customer/worker
* Edit existing data
* Use modal popup (no page reload)

### 🚟 Modal Form Behavior

* ➕ Add New Record → Opens in **add mode**
* 🖊️ Edit → Opens in **edit mode** with filled data

### 📄 Form Fields

| Label           | Input    | Field Name       | Validation  |
| --------------- | -------- | ---------------- | ----------- |
| Name            | Text     | `name`           | Required    |
| Passport Number | Text     | `passportNumber` | Optional    |
| Passport Expiry | Date     | `passportExpiry` | Optional    |
| ID Number       | Text     | `idNumber`       | Optional    |
| ID Expiry       | Date     | `idExpiry`       | Optional    |
| Join Date       | Date     | `joinDate`       | Optional    |
| Phone Number    | Text     | `phone`          | Optional    |
| Due Balance ( ﷼ ) | Number   | `dueBalance`     | Default = 0 |
| Notes           | Textarea | `notes`          | Optional    |

### ✅ Form Validation

* Name is **required**
* `dueBalance` must be a number (can be 0)
* Use date pickers
* Validate phone (nice to have)

### 📤 Form Actions

| Action | Behavior |
| ------ | -------- |
| Submit | Calls:   |

```
        * `POST /record` (new)
        * `PUT /record/:id` (edit)
```

\| Cancel   | Closes modal without saving                             |

### 🔄 API Integration

```ts
// Add
fetch('/api/record', {
  method: 'POST',
  body: JSON.stringify(formData),
  headers: { 'Content-Type': 'application/json' }
});

// Edit
fetch(`/api/record/${recordId}`, {
  method: 'PUT',
  body: JSON.stringify(updatedFormData),
  headers: { 'Content-Type': 'application/json' }
});
```

### 🎨 UX Notes

* Modal should animate smoothly
* Show loading spinner or "Saving..."
* On success: close modal and refresh
* Show toast message like: “✅ Record saved successfully”

### 🖼️ Inline Add Button

```html
<button class="bg-blue-600 text-white px-4 py-2 rounded-lg">
  ➕ Add New Record
</button>
```

---
"# limozin" 
