import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api'; // 🔥 INI IMPORT KUNCI UTAMANYA

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // 🔥 MENGGUNAKAN API.POST (Tidak perlu localhost dan headers manual lagi)
      const response = await API.post('/api/auth/login', formData);
      const result = response.data;

      if (result.success) {
        // Ambil token dan data user 
        const token = result.token || result.data?.token;
        const userRole = result.user?.role || result.data?.user?.role || 'pembeli';

        // Simpan kunci ke dalam memori browser
        localStorage.setItem('token', token);
        localStorage.setItem('role', userRole);

        // 👇 LOGIKA PINTU PINTAR (SMART ROUTING) 👇
        if (userRole === 'owner' || userRole === 'admin') {
          navigate('/admin'); // Bos langsung ke Dashboard
        } else if (userRole === 'kasir') {
          navigate('/kasir'); // Kasir langsung ke Mesin POS
        } else {
          navigate('/'); // Pembeli biasa masuk ke Halaman Utama
        }
      } else {
        setError(result.message || 'Login gagal. Coba periksa lagi email dan passwordmu.');
      }
    } catch (err) {
      // 🔥 Axios melemparkan error kalau password salah, jadi kita tangkap di sini
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Login gagal. Coba periksa email dan passwordmu.');
      } else {
        setError('Gagal menghubungi satpam server. Pastikan Backend menyala.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-sans p-4">
      <div className="bg-white p-10 rounded-[2rem] shadow-2xl w-full max-w-md border border-gray-100">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-red-900 mb-2 tracking-widest">SA BAKERY</h1>
          <p className="text-xs text-gray-400 uppercase tracking-[0.3em] font-bold">Silakan Masuk</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm font-bold text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Email</label>
            <input 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-red-500 focus:bg-white transition-colors" 
              placeholder="Masukkan email..." 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Password</label>
            <input 
              name="password" 
              type="password" 
              value={formData.password} 
              onChange={handleChange} 
              className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-red-500 focus:bg-white transition-colors" 
              placeholder="••••••••" 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-red-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-900/30 hover:bg-red-800 transition-all hover:scale-[1.02] active:scale-95"
          >
            {loading ? 'Membuka Kunci...' : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500">
            Pelanggan baru? <Link to="/register" className="text-red-900 font-bold hover:underline">Daftar di sini</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;