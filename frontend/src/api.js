import axios from 'axios';

// In development: VITE_API_URL = http://localhost:5000 (from .env)
// In production:  VITE_API_URL = https://your-backend.onrender.com (from .env.production)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

export default api;
