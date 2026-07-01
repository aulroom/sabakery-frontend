import axios from 'axios';

// Membuat konfigurasi dasar untuk menembak ke Backend
const API = axios.create({
  baseURL: 'https://sabakery-backend.onrender.com', // Sesuaikan dengan URL Backend kamu
});

// Menyisipkan token otomatis ke setiap request (jika user sudah login)
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;