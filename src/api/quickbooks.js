import axios from "axios";

// ✅ USE SAME ENV VARIABLE EVERYWHERE
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL?.trim() ||
  "https://ai-tax-agent-backend-1.onrender.com";

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