import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders'); // Langsung buka ke tab pesanan
  const userRole = localStorage.getItem('role') || 'pembeli';

  // State untuk menyimpan data asli dari database (Tab Info)
  const [user, setUser] = useState({ username: '', email: '', full_name: '', phone: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // State untuk menyimpan data Pesanan (Tab Orders)
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // MENGAMBIL DATA PROFIL SAAT HALAMAN DIBUKA
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
          setUser({
            username: result.data.username || '',
            email: result.data.email || '',
            full_name: result.data.full_name || result.data.username || '', 
            phone: result.data.phone || ''
          });
        }
      } catch (error) {
        console.error("Gagal mengambil profil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // MENGAMBIL DATA PESANAN JIKA TAB PESANAN DIKLIK
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchMyOrders();
    }
  }, [activeTab]);

  const fetchMyOrders = async () => {
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders || []);
      }
    } catch (error) {
      console.error("Gagal mengambil riwayat pesanan:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    alert('Sampai jumpa kembali! 🥐');
    navigate('/login');
  };

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // MENYIMPAN HASIL EDIT KE DATABASE
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: user.full_name,
          phone: user.phone
        })
      });
      
      const result = await response.json();
      if (result.success) {
        alert('Profil berhasil diperbarui! 🎉');
        setIsEditing(false);
      } else {
        alert('Gagal memperbarui profil.');
      }
    } catch (error) {
      alert('Terjadi kesalahan pada server.');
    }
  };

  // 👇 FUNGSI BARU: PEMBELI KONFIRMASI BARANG DITERIMA 👇
  const confirmDelivery = async (orderId) => {
    if(window.confirm("Apakah kamu yakin pesanan sudah sampai di tanganmu dengan aman?")) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ status: 'delivered' })
        });
        
        if (response.ok) {
          alert("Yeay! Terima kasih, selamat menikmati rotinya! 🎉");
          fetchMyOrders(); // Langsung refresh layar pembeli
        }
      } catch (error) { 
        alert("Gagal mengonfirmasi pesanan."); 
      }
    }
  };

  // 👇 FUNGSI PERBAIKAN TANGGAL (Obat Anti-Invalid Date) 👇
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' });
    } catch (e) { return '-'; }
  };

  // PENERJEMAH STATUS PESANAN
  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">🕒 Menunggu Kasir</span>;
      case 'preparing': return <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">👨‍🍳 Sedang Dipanggang</span>;
      case 'delivering': return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">🛵 Sedang Dikirim</span>;
      case 'delivered': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">✅ Selesai</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">❌ Dibatalkan</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  if (loading) return <div className="min-h-screen bg-crumb-cream flex items-center justify-center text-crumb-maroon font-serif text-2xl animate-pulse">Memuat Profil...</div>;

  return (
    <div className="min-h-screen bg-crumb-cream font-sans pb-10">
      
      {/* NAVBAR */}
      <nav className="bg-crumb-maroon text-crumb-cream py-4 px-8 flex justify-between items-center shadow-md mb-8">
        <Link to="/" className="text-2xl font-serif tracking-widest font-bold cursor-pointer">CRUMB THEORY</Link>
        <button onClick={() => navigate('/')} className="bg-crumb-cream text-crumb-maroon px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white transition-all shadow-md">
          Belanja Lagi 🛒
        </button>
      </nav>

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden px-4 sm:px-0">
        
        {/* HEADER PROFIL */}
        <div className="bg-crumb-maroon p-8 text-white flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white text-crumb-maroon rounded-full flex items-center justify-center text-4xl shadow-inner">
              👤
            </div>
            <div>
              <h1 className="text-3xl font-bold font-serif">{user.full_name || user.username}</h1>
              <p className="opacity-80 uppercase text-xs tracking-widest font-bold mt-1 bg-black bg-opacity-20 inline-block px-3 py-1 rounded-full">
                ROLE: {userRole}
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-full font-bold shadow-lg transition-all hover:scale-105">
            Logout
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {['orders', 'info', 'address', 'security'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[120px] py-4 font-bold uppercase text-sm transition-colors ${activeTab === tab ? 'text-crumb-maroon border-b-4 border-crumb-maroon bg-red-50' : 'text-gray-400 hover:text-crumb-maroon hover:bg-gray-50'}`}
            >
              {tab === 'info' ? 'Info Pribadi' : tab === 'address' ? 'Alamat' : tab === 'orders' ? 'Pesanan Saya' : 'Keamanan'}
            </button>
          ))}
        </div>

        {/* KONTEN TAB */}
        <div className="p-8">
          
          {/* TAB PESANAN (ORDER TRACKING) */}
          {activeTab === 'orders' && (
            <div className="animate-fadeIn">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-crumb-maroon">Status Pesanan</h2>
                <button onClick={fetchMyOrders} className="text-sm font-bold bg-crumb-cream text-crumb-maroon px-4 py-2 rounded-lg hover:bg-red-100 transition-colors border border-crumb-maroon shadow-sm">
                  🔄 Refresh Status
                </button>
              </div>

              {loadingOrders ? (
                <div className="text-center py-10 text-crumb-maroon animate-pulse font-bold">Mengecek dapur...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                  <p className="text-xl font-bold text-gray-400 mb-2">Belum ada pesanan.</p>
                  <Link to="/" className="text-crumb-maroon font-bold hover:underline">Mulai Pesan Roti Sekarang!</Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-2">
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase">NO. NOTA: <span className="text-crumb-maroon">{order.order_number}</span></p>
                          {/* Tanggal Invalid sudah diperbaiki! */}
                          <p className="text-xs text-gray-500 mt-1">{formatDate(order.created_at || order.createdAt)}</p>
                        </div>
                        <div>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white">
                        {order.items && order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                            <span className="font-bold text-sm text-gray-700">{item.quantity}x {item.food_name}</span>
                            <span className="text-sm text-gray-600">Rp {parseInt(item.subtotal).toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                        
                        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between items-end">
                          <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Penerimaan</p>
                            <p className="text-sm font-bold text-gray-800 max-w-[200px] truncate">{order.delivery_address}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 font-bold uppercase">Total</p>
                            <p className="text-lg font-bold text-crumb-maroon">Rp {parseInt(order.total).toLocaleString('id-ID')}</p>
                          </div>
                        </div>

                        {/* 👇 TOMBOL KONFIRMASI (MUNCUL KALAU STATUSNYA "SEDANG DIKIRIM") 👇 */}
                        {order.status === 'delivering' && (
                          <div className="mt-6 pt-4 border-t border-gray-100 bg-blue-50 -mx-4 -mb-4 p-4 text-center">
                            <p className="text-xs text-blue-600 font-bold mb-3 animate-pulse">Apakah pesanan sudah sampai di tanganmu?</p>
                            <button 
                              onClick={() => confirmDelivery(order.id)}
                              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md transition-transform hover:scale-[1.01]"
                            >
                              ✅ Ya, Pesanan Sudah Diterima
                            </button>
                          </div>
                        )}
                        
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 1. TAB INFO PRIBADI */}
          {activeTab === 'info' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-crumb-maroon">Detail Profil</h2>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="text-sm font-bold bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    ✏️ Edit Profil
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button onClick={() => setIsEditing(false)} className="text-sm font-bold bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">Batal</button>
                    <button onClick={handleSave} className="text-sm font-bold bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-md">💾 Simpan</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Username (Paten)</label>
                  <input className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" value={user.username} disabled />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email (Paten)</label>
                  <input className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" value={user.email} disabled />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-crumb-maroon mb-2">Nama Lengkap</label>
                  <input 
                    name="full_name" 
                    className={`w-full p-3 border rounded-lg transition-colors ${isEditing ? 'border-crumb-maroon bg-white shadow-sm focus:outline-none' : 'border-gray-200 bg-gray-50 text-gray-600'}`} 
                    value={user.full_name} 
                    onChange={handleInputChange} 
                    disabled={!isEditing} 
                    placeholder="Masukkan nama lengkap..." 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-crumb-maroon mb-2">Nomor Telepon</label>
                  <input 
                    name="phone" 
                    className={`w-full p-3 border rounded-lg transition-colors ${isEditing ? 'border-crumb-maroon bg-white shadow-sm focus:outline-none' : 'border-gray-200 bg-gray-50 text-gray-600'}`} 
                    value={user.phone} 
                    onChange={handleInputChange} 
                    disabled={!isEditing} 
                    placeholder="Contoh: 0812xxxxxx" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB LAINNYA */}
          {(activeTab === 'address' || activeTab === 'security') && (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl animate-fadeIn">
              <p className="text-xl font-bold text-gray-400 mb-2">Fitur {activeTab} Segera Datang!</p>
              <p className="text-sm text-gray-400">Kita fokus menyelesaikan menu Informasi & Pesanan dulu ya.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Profile;