// src/api/apiFetch.js
import { getEnv } from "./getEnv";

export const apiFetch = async (url, auth, options = {}) => {
  // Always send Authorization header for all endpoints
  let headers = { ...options.headers, 'Content-Type': 'application/json' };
  const env = getEnv();
  const user = auth?.user || env.VITE_API_USER;
  const password = auth?.password || env.VITE_API_PASS;
  if (user && password) {
    headers = {
      ...headers,
      Authorization: `Basic ${btoa(`${user}:${password}`)}`,
    };
  }
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) throw new Error(await response.text());
  // Handle empty response (e.g., DELETE 204/200)
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
};