// API Configuration
// Uses environment variables for production, falls back to localhost for development
// Note: Do NOT include /api in the base URL - it's added by individual endpoints
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';
export const SITE_URL = process.env.REACT_APP_SITE_URL || 'http://127.0.0.1:8000';
