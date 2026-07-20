import axios from 'axios';

/**
 * axiosInstance
 *
 * withCredentials: true is required for the httpOnly JWT cookie (both the
 * customer "token" cookie and the admin "adminToken" cookie) to actually be
 * sent and received across origins — the frontend (Vercel) and backend
 * (Render) are different origins in production, so this isn't optional.
 * See the backend's app.js CORS config (`credentials: true`) — both sides
 * must agree, or the cookie silently never gets sent.
 *
 * The response interceptor unwraps every response to response.data — the
 * backend's { success, data } envelope — so every api/*.js function below
 * just returns `res.data` (the actual payload), and every page/component
 * that calls them works with real data directly, never with the envelope.
 * Error responses are untouched by this and still reject normally.
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use((response) => response.data);

export default axiosInstance;