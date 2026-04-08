import axios from "axios";

// ✅ REMOVE import.meta (BREAKING BUILD)
// ✅ USE FIXED URL

const API_BASE_URL = "https://ai-tax-agent-backend-lxlw.onrender.com";

const API = axios.create({
  baseURL: `${API_BASE_URL}/quickbooks`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const getCompanyInfo = () => API.get("/status");
export const getCustomers = () => API.get("/customers");
export const getInvoices = () => API.get("/invoices");
export const getAccounts = () => API.get("/accounts");
export const addExpense = (data) => API.post("/expenses", data);

export default API;