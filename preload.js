const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  addDropdownValue: async (type, value) => {
    try {
      return await ipcRenderer.invoke("add-dropdown-value", type, value);
    } catch (err) {
      console.error("Error in addDropdownValue:", err);
      throw err;
    }
  },

  getDropdown: async (type) => {
    try {
      const data = await ipcRenderer.invoke("get-dropdown", type);
      return data;
    } catch (err) {
      console.error("Error in getDropdown:", err);
      return [];
    }
  },

  saveBill: async (data) => {
    try {
      const billId = await ipcRenderer.invoke("saveBill", data);
      console.log("✅ Bill saved with ID:", billId);
      return billId;
    } catch (err) {
      console.error("❌ Error in saveBill:", err);
      throw err;
    }
  },

  getBillsByDate: async (date) => {
    try {
      const bills = await ipcRenderer.invoke("getBillsByDate", date);
      return bills;
    } catch (err) {
      console.error("❌ Error in getBillsByDate:", err);
      return [];
    }
  },
  getNextConNo: () => ipcRenderer.invoke("getNextConNo"),
});
