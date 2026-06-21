const API_BASE_URL = 'http://test-demo.aemenersol.com/api';

let authToken = null;

function setToken(token) {
  authToken = token;
}

function getToken() {
  return authToken;
}

function clearToken() {
  authToken = null;
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

function login(credentials) {
  return apiRequest('/account/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}

function getDashboard() {
  return apiRequest('/dashboard');
}

window.api = {
  setToken,
  getToken,
  clearToken,
  apiRequest,
  login,
  getDashboard
};
