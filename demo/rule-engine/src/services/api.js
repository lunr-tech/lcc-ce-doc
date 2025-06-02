// src/services/api.js
import axios from 'axios';

// Create axios instance with base config
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://api:5174/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 10000
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const res = await apiClient.post('/blockly/login', {
    username: import.meta.env.VITE_API_USER || '',
    password: import.meta.env.VITE_API_PASSWORD || ''
});
localStorage.setItem('token', res.data.token);

// API service class
export default {
    sendGeneratedCode(code) {
        return apiClient.post('/blockly/mqtt', {code});
    },
    getApkOptions() {
        return apiClient.get('/blockly/apk');
    },
    getOSVersions() {
        return apiClient.get('/blockly/os');
    },
    getSensors() {
        return apiClient.get('/blockly/sensors');
    },
    getDeviceCategories() {
        return apiClient.get('/blockly/deviceCategories');
    }
};