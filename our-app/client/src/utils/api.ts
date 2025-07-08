import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    withCredentials: true, // Set to true if you need cookies/auth, otherwise remove
});

export default api; 