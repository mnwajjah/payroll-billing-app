// src/api/index.js
// 2026-07-05 added auth token injection

const API_BASE = process.env.REACT_APP_API_URL || '';

function get_token()
{
    return localStorage.getItem('pbm_token');
}

function get_headers()
{
    const headers = { 'Content-Type': 'application/json' };
    const token = get_token();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
}

async function api_get(path)
{
    const response = await fetch(API_BASE + '/api' + path, { headers: get_headers() });
    if (response.status === 401) { window.location.href = '/login'; return; }
    if (!response.ok) throw new Error('Request failed: ' + response.status);
    return response.json();
}

async function api_post(path, body)
{
    const response = await fetch(API_BASE + '/api' + path, {
        method: 'POST',
        headers: get_headers(),
        body: JSON.stringify(body)
    });
    if (response.status === 401) { window.location.href = '/login'; return; }
    if (!response.ok) throw new Error('Request failed: ' + response.status);
    return response.json();
}

async function api_put(path, body)
{
    const response = await fetch(API_BASE + '/api' + path, {
        method: 'PUT',
        headers: get_headers(),
        body: JSON.stringify(body)
    });
    if (response.status === 401) { window.location.href = '/login'; return; }
    if (!response.ok) throw new Error('Request failed: ' + response.status);
    return response.json();
}

async function api_delete(path)
{
    const response = await fetch(API_BASE + '/api' + path, { method: 'DELETE', headers: get_headers() });
    if (response.status === 401) { window.location.href = '/login'; return; }
    if (!response.ok) throw new Error('Request failed: ' + response.status);
    return response.json();
}

export { api_get, api_post, api_put, api_delete, get_token };
