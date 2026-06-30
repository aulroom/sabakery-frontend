import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import CashierDashboard from './pages/CashierDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
// 👇 KITA IMPORT RUANGAN PROFIL DI SINI
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Jalur Utama: Etalase Pembeli */}
        <Route path="/" element={<Home />} />

        {/* Jalur Pendaftaran & Masuk */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 👇 DAFTARKAN JALUR PROFIL KE SATPAM 👇 */}
        <Route path="/profile" element={<Profile />} />

        {/* Jalur Khusus: Ruang Owner */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Jalur Khusus: Meja Kasir */}
        <Route path="/kasir" element={<CashierDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;