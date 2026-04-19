// src/api/apiFetch.js
export const apiFetch = async (url, auth, options = {}) => {
  // Always send Authorization header for all endpoints
  let headers = { ...options.headers, 'Content-Type': 'application/json' };
  const user = auth?.user || import.meta.env.VITE_API_USER;
  const password = auth?.password || import.meta.env.VITE_API_PASS;
  if (user && password) {
    headers = {
      ...headers,
      Authorization: `Basic ${btoa(`${user}:${password}`)}`,
    };
  }
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};