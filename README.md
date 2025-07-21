# 🚚 Courier Bill Pro

Courier Bill Pro is a **desktop billing application** developed specifically for a local **Professional Couriers outlet** to simplify and manage their internal billing operations.

This application provides an easy way to manage consignments, calculate GST, print bills, and retrieve past invoices — all from a desktop-based, user-friendly interface.

---

## 📌 Why This Project?

One of the Professional Couriers branches needed a custom tool for their daily operations:

- Handwritten bills were time-consuming
- Tracking previous invoices was difficult
- They wanted an all-in-one solution that’s fast, offline, and tailored to their workflow

> So, **Courier Bill Pro** was built to solve that exact need.

---

## 🧠 Features

✅ **Add Consignments Dynamically**  
✅ **Auto-fill Consignee & Destination fields**  
✅ **Calculate totals and GST instantly**  
✅ **Print professional-looking invoices**  
✅ **Retrieve and view bills by date**  
✅ **All data stored locally using SQLite**  
✅ **Offline-first experience**  

---

## 💻 Tech Stack

| Layer       | Technology Used         |
|-------------|--------------------------|
| UI/Frontend | HTML, CSS, JavaScript   |
| Backend     | Electron.js (Node.js)   |
| Database    | SQLite                  |
| Styling     | Custom CSS + Media Print |
| IPC Bridge  | Electron IPC (Main <-> Renderer) |

---

## 📸 User Interface Highlights

- **Simple form** to add multiple consignments per bill
- **Autocomplete dropdowns** for saved consignee and destination names
- **One-click print** with a layout designed for A4 invoices
- **Dark/light friendly interface** (customizable)

---

## 🧾 How the Invoice Looks

- Contains:
  - Consignment number
  - Weight
  - Destination
  - Consignee
  - Amounts with subtotal + GST + total
  - Amount in words
- Includes company branding and signature section
- Prints cleanly with `@media print` CSS hiding all extra UI

---

## 🗃️ Database Schema

All billing data is stored locally in a lightweight SQLite database (`bills.db`). Below is the schema:

```sql
CREATE TABLE IF NOT EXISTS consignee (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS destination (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS bills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_date TEXT NOT NULL,
  gst_percent REAL DEFAULT 0,
  gst_amount REAL DEFAULT 0,
  total REAL DEFAULT 0,
  grand_total REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS consignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  con_no TEXT NOT NULL,
  consignee TEXT NOT NULL,
  weight TEXT NOT NULL,
  destination TEXT NOT NULL,
  amount REAL DEFAULT 0,
  FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
);
```
## 🚀 How to Run the App
1. Clone the Repository

git clone https://github.com/yourusername/courier-bill-pro.git
cd courier-bill-pro

2. Install Dependencies

npm install

3. Run the App

npm start

    Node.js is required. You can download it from nodejs.org.

## 📁 File Structure
<pre>
courier-billing-app/
├── main.js                 # Electron main process: initializes app, DB, IPC
├── preload.js              # (optional) Preload script for contextBridge (not provided yet)
├── renderer.js             # Handles frontend DOM & IPC
├── index.html              # UI layout
├── styles.css              # Custom styles for the UI and print
├── schema.sql              # SQLite schema with all required tables
├── package.json            # Node.js and Electron dependencies
├── .gitignore              # Ignored files/folders (e.g., node_modules)
└── README.md               # Project documentation (this file)
</pre>

## 🧑‍💼 About the Client

This project was developed on request for a specific Professional Couriers outlet to digitize their paper-based billing system. It is a custom-made, offline-capable desktop app tailored to their internal operations.

## 🔐 License

This software is a private, client-specific project and is not open for redistribution or commercial reuse without permission.

## 📬 Contact

Want a similar app for your business?
Feel free to reach out!

Developer: Prajwal Mutalik , Fida Khanum <br>
📧 Email: prajwalmutalik8@gmail.com, ksfida2004@gmail.com



