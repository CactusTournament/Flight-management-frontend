// Mock for apiFetch to avoid import.meta.env issues in Jest
defaultExport = async (url, auth, options = {}) => {
  return { success: true, data: {} };
};

export const apiFetch = defaultExport;
export default defaultExport;
