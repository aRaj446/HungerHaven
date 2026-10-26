// Centralized configuration for the frontend.
// Set REACT_APP_API_BASE_URL in a .env file inside the frontend/ folder to override for other environments.
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
