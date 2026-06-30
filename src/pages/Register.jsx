import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 👇 STATE BARU UNTUK TOMBOL MATA 👇
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();

      if (result.success) {
        alert('Registrasi berhasil! Silakan masuk menggunakan akun barumu. 🍞');
        navigate('/login');
      } else {
        setError(result.message || 'Gagal mendaftar. Username/Email mungkin sudah terpakai.');
      }
    } catch (err) {
      setError('Gagal menghubungi server. Pastikan Backend menyala.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-sans p-4">
      <div className="bg-white p-10 rounded-[2rem] shadow-2xl w-full max-w-md border border-gray-100 my-8">
        
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-red-900 mb-2 tracking-widest">SA BAKERY</h1>
          <p className="text-xs text-gray-400 uppercase tracking-[0.3em] font-bold">Buat Akun Baru</p>
        </div>
        
        {/* PESAN ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm font-bold text-center animate-fadeIn">
            {error}
          </div>
        )}

        {/* FORM REGISTRASI */}
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Nama Lengkap</label>
            <input 
              name="full_name" 
              type="text" 
              value={formData.full_name} 
              onChange={handleChange} 
              className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-red-500 focus:bg-white transition-colors" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Username</label>
            <input 
              name="username" 
              type="text" 
              value={formData.username} 
              onChange={handleChange} 
              className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-red-500 focus:bg-white transition-colors" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Email</label>
            <input 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-red-500 focus:bg-white transition-colors" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Password</label>
            {/* 👇 KOTAK PASSWORD DENGAN IKON MATA 👇 */}
            <div className="relative">
              <input 
                name="password" 
                type={showPassword ? "text" : "password"} 
                value={formData.password} 
                onChange={handleChange} 
                className="w-full p-4 pr-12 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-red-500 focus:bg-white transition-colors" 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-900 focus:outline-none transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg> // Mata Terbuka
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg> // Mata Tercoret
                )}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-red-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-900/30 hover:bg-red-800 transition-all hover:scale-[1.02] active:scale-95 mt-4"
          >
            {loading ? 'Memanggang Data...' : 'Daftar Sekarang'}
          </button>
        </form>

        {/* FOOTER LINK */}
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500">
            Sudah punya akun? <Link to="/login" className="text-red-900 font-bold hover:underline">Login di sini</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;