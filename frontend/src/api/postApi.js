const configuredApi = import.meta.env.VITE_API_URL?.trim();
const configuredBase = configuredApi
  ? `${configuredApi.replace(/\/$/, '').replace(/\/api$/i, '')}/api`
  : `${window.location.origin}/api`;
const API_BASE = configuredBase.replace(/\/$/, '');

export function apiOrigin() {
  return API_BASE.replace(/\/api$/i, '');
}

export function assetUrl(path) {
  if (!path || /^(https?:)?\/\//i.test(path) || path.startsWith('blob:')) return path;
  return `${apiOrigin()}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function apiRequest(path, { method = 'GET', token = '', body, signal } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body && !isForm) headers['Content-Type'] = 'application/json';
  let response;
  try {
    response = await fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('The Scroll API is not connected yet. You can still explore in preview mode.', { cause: error });
  }
  let data = {};
  const text = await response.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = { message: 'The server returned an unexpected response.' }; }
  }
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status}).`);
  return data;
}

export const getPosts = () => apiRequest('/posts?limit=20');
export const getFeed = (token) => apiRequest('/posts/feed?limit=20', { token });
export const getComments = (postId, token) => apiRequest(`/posts/${postId}/comments?limit=50`, { token });
export const loginUser = (email, password) => apiRequest('/auth/login', { method: 'POST', body: { email, password } });
export const registerUser = (username, email, password, age) => apiRequest('/auth/register', { method: 'POST', body: { username, email, password, age: Number(age) } });

export async function createPost(content, files, token) {
  const formData = new FormData();
  formData.append('content', content);
  files.forEach((file) => formData.append('media', file));
  return apiRequest('/posts', { method: 'POST', token, body: formData });
}
