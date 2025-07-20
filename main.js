const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

let db, dbPath, dbFolder, schemaPath;

function initializeDatabase() {
  // Ensure db folder exists
  if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder, { recursive: true });
  }

  const isNew = !fs.existsSync(dbPath);
  db = new sqlite3.Database(dbPath);

  // Always ensure tables exist, even if DB already present
  db.exec(`
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
  `);

  if (isNew) {
    // Also apply full schema from schema.sql if you want (optional)
    if (fs.existsSync(schemaPath)) {
      const schemaSQL = fs.readFileSync(schemaPath, "utf8");
      db.exec(schemaSQL, (err) => {
        if (err) {
          console.error("❌ Error applying schema.sql:", err.message);
        } else {
          console.log("✅ Schema applied from schema.sql");
        }
      });
    }
  } else {
    console.log("✅ DB exists in userData. Tables ensured.");
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile("index.html");
}

app.whenReady().then(() => {
  const userDataPath = app.getPath("userData"); // Now possible
  dbFolder = path.join(userDataPath, "db");
  dbPath = path.join(dbFolder, "bills.db");
  schemaPath = path.join(__dirname, "db", "schema.sql");

  initializeDatabase();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ------------------------------------------
// ✅ IPC HANDLERS (unchanged)
// ------------------------------------------

ipcMain.handle("add-dropdown-value", async (event, type, name) => {
  const table = type === "consignee" || type === "destination" ? type : null;
  if (!table) throw new Error("Invalid dropdown type");

  return new Promise((resolve, reject) => {
    db.run(`INSERT OR IGNORE INTO ${table}(name) VALUES(?)`, [name], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

ipcMain.handle("get-dropdown", async (_, type) => {
  const table = type === "consignee" ? "consignee" : "destination";

  return new Promise((resolve, reject) => {
    db.all(`SELECT name FROM ${table}`, (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map((r) => r.name));
    });
  });
});

ipcMain.handle("saveBill", async (_, bill) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO bills (bill_date, gst_percent, gst_amount, total, grand_total)
       VALUES (?, ?, ?, ?, ?)`,
      [bill.date, bill.gstPercent, bill.gstAmount, bill.total, bill.grandTotal],
      function (err) {
        if (err) return reject(err);

        const billId = this.lastID;
        const stmt = db.prepare(
          `INSERT INTO consignments (bill_id, date, con_no, consignee, weight, destination, amount)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        );

        bill.items.forEach((item) => {
          stmt.run([
            billId,
            item.date || bill.date,
            item.conNo,
            item.consignee,
            item.weight,
            item.destination,
            item.amount,
          ]);
        });

        stmt.finalize((err2) => {
          if (err2) return reject(err2);
          resolve(billId);
        });
      }
    );
  });
});

ipcMain.handle("getBillsByDate", (event, date) => {
  console.log("Querying for date:", date);
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM bills WHERE bill_date = ?`, [date], (err, bills) => {
      if (err) return reject(err);
      if (!bills.length) return resolve([]);

      const out = [];
      let pending = bills.length;

      bills.forEach((bill) => {
        db.all(
          `SELECT * FROM consignments WHERE bill_id = ?`,
          [bill.id],
          (err2, consignments) => {
            if (err2) return reject(err2);

            bill.items = consignments;
            out.push(bill);

            if (--pending === 0) {
              console.log("Returning bills:", out);
              resolve(out);
            }
          }
        );
      });
    });
  });
});
ipcMain.handle("getNextConNo", async () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) AS count FROM consignments", (err, row) => {
      if (err) reject(err);
      else resolve(row.count + 1); // globally running
    });
  });
});
