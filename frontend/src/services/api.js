/**
 * BreedVision — API service
 * All HTTP calls go through this module so the base URL is one place to change.
 */

import axios from 'axios';

// In development, CRA's proxy (package.json → "proxy") forwards /api/* to Flask.
// In production, set REACT_APP_API_URL=https://your-backend.com
const BASE_URL = process.env.REACT_APP_API_URL || 'https://breedvision.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000, // 30 s — ML inference can be slow
});

/**
 * Upload an image and receive breed prediction.
 * @param {File} imageFile
 * @returns {Promise<{ breed, confidence, details }>}
 */
export async function predictBreed(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  const { data } = await api.post('/api/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/**
 * Fetch paginated prediction history.
 * @param {number} page
 * @param {number} limit
 */
export async function fetchHistory(page = 1, limit = 10) {
  const { data } = await api.get('/api/history', { params: { page, limit } });
  return data; // { items, total, page, pages }
}

/**
 * Delete a single history entry.
 * @param {string} id
 */
export async function deleteHistoryEntry(id) {
  const { data } = await api.delete(`/api/history/${id}`);
  return data;
}

/**
 * Clear all history.
 */
export async function clearHistory() {
  const { data } = await api.delete('/api/history');
  return data;
}

/**
 * Fetch all breeds from the catalogue.
 */
export async function fetchBreeds() {
  const { data } = await api.get('/api/breeds');
  return data;
}
