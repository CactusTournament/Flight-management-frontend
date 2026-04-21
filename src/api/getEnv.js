// src/api/getEnv.js
export function getEnv() {
  return {
    VITE_API_USER: import.meta.env.VITE_API_USER,
    VITE_API_PASS: import.meta.env.VITE_API_PASS,
    VITE_API_URL: import.meta.env.VITE_API_URL,
  };
}
