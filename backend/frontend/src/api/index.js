// src/api/index.js
// 2026-07-05 centralized API calls to Railway backend

const API_BASE = process.env.REACT_APP_API_URL || '';

async function api_get(path)
{
    const response = await fetch(API_BASE + '/api' + path);
    if (!response.ok)
    {
        throw new Error('Request failed: ' + response.status);
    }
    return response.json();
}

async function api_post(path, body)
{
    const response = await fetch(API_BASE + '/api' + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!response.ok)
    {
        throw new Error('Request failed: ' + response.status);
    }
    return response.json();
}

async function api_delete(path)
{
    const response = await fetch(API_BASE + '/api' + path, { method: 'DELETE' });
    if (!response.ok)
    {
        throw new Error('Request failed: ' + response.status);
    }
    return response.json();
}

export { api_get, api_post, api_delete };
