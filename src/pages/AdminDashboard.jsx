import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllFoods, createFood, deleteFood } from '../services/foodService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const userRole = localStorage.getItem('role') || 'owner';

  const [stats, setStats] = useState({ revenue: 0, completed: 0, bestSeller: 'Belum Ada' });
  const [loading, setLoading] = useState(true);
  const [foods, setFoods] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', price: '' });
  const [imageFile, setImageFile] = useState(null);

  const [revenueChart, setRevenueChart] = useState([]);
  const [menuChart, setMenuChart] = useState([]);

  useEffect(() => {
    fetchRealData();
    fetchFoods();
  }, []);

  const fetchRealData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        const orders = data.data.orders || data.data || [];
        let totalRevenue = 0;
        let totalCompleted = 0;
        
        const tempMenuCount = {};
        const tempDailyRevenue = {};

        orders.forEach(order => {
          if (order.status === 'delivered') {
            totalRevenue += parseInt(order.total);
            totalCompleted += 1;

            // 👇 OBAT ANTI INVALID DATE 👇
            const dateVal = order.created_at || order.createdAt;
            const dateObj = new Date(dateVal);
            const dateStr = isNaN(dateObj.getTime()) ? 'Bulan Ini' : dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }); 
            
            tempDailyRevenue[dateStr] = (tempDailyRevenue[dateStr] || 0) + parseInt(order.total);

            if (order.items) {
              order.items.forEach(item => {
                const name = item.food_name;
                tempMenuCount[name] = (tempMenuCount[name] || 0) + parseInt(item.quantity);
              });
            }
          }
        });

        let topMenu = 'Belum Ada';
        let maxQty = 0;
        for (const [name, qty] of Object.entries(tempMenuCount)) {
          if (qty > maxQty) { maxQty = qty; topMenu = name; }
        }
        setStats({ revenue: totalRevenue, completed: totalCompleted, bestSeller: topMenu });

        const formattedRevenue = Object.keys(tempDailyRevenue).map(date => ({
          tanggal: date,
          pendapatan: tempDailyRevenue[date]
        }));
        setRevenueChart(formattedRevenue);

        const formattedMenu = Object.keys(tempMenuCount).map(name => ({
          namaRoti: name,
          terjual: tempMenuCount[name]
        }));
        setMenuChart(formattedMenu);
      }
    } catch (error) { console.error("Gagal load data:", error); } 
    finally { setLoading(false); }
  };

  const fetchFoods = async () => {
    try {
      const data = await getAllFoods();
      setFoods(Array.isArray(data) ? data : []);
    } catch (error) { console.error("Gagal memuat makanan"); }
  };

  const handleCreateFood = async (e) => {
    e.preventDefault(); 
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      if (imageFile) submitData.append('image', imageFile); 

      await createFood(submitData);
      alert("YEAY! Menu baru berhasil dimasukkan ke Database! 🥖");
      setFormData({ name: '', description: '', price: '' }); 
      setImageFile(null);
      fetchFoods(); 
    } catch (error) { alert("Gagal menambah menu."); }
  };

  const handleDeleteFood = async (id) => {
    if (window.confirm("Yakin ingin menghapus roti ini selamanya?")) {
      try { await deleteFood(id); fetchFoods(); } 
      catch (error) { alert("Gagal menghapus menu."); }
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-2xl animate-pulse">Menyiapkan Ruang Bos...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      
      {/* SIDEBAR HITAM KIRI */}
      <div className="w-64 bg-[#111827] text-white flex flex-col shadow-2xl fixed h-full z-20">
        <div className="p-8 text-center border-b border-gray-800">
          {/* 👇 UBAH NAMA BRAND DI SINI 👇 */}
          <h1 className="text-3xl font-serif tracking-widest font-bold text-red-500">SA<br/>BAKERY</h1>
        </div>
        
        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-4">
            <li onClick={() => setActiveTab('dashboard')} className={`py-3 px-4 rounded-lg flex items-center space-x-3 font-bold cursor-pointer transition-colors ${activeTab === 'dashboard' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              <span>📊</span><span>Dashboard</span>
            </li>
            <li onClick={() => setActiveTab('menu')} className={`py-3 px-4 rounded-lg flex items-center space-x-3 font-bold cursor-pointer transition-colors ${activeTab === 'menu' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              <span>🥐</span><span>Kelola Menu Toko</span>
            </li>
            <li onClick={() => alert('Fitur Data Pegawai akan segera hadir! 🚀')} className="text-gray-400 hover:text-white hover:bg-gray-800 py-3 px-4 rounded-lg flex items-center space-x-3 transition-colors cursor-pointer">
              <span>👥</span><span>Data Pegawai</span>
            </li>
          </ul>
        </nav>

        <div className="p-4">
          <button onClick={handleLogout} className="w-full bg-gray-800 border border-gray-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
            Keluar (Logout)
          </button>
        </div>
      </div>

      <div className="flex-1 p-10 overflow-y-auto ml-64 bg-[#FDFBF7] min-h-screen">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-bold text-gray-800 font-serif">
            {activeTab === 'dashboard' ? 'Selamat Datang, Bos! 👑' : 'Dapur Menu Toko 👨‍🍳'}
          </h2>
          <span className="bg-red-100 text-red-800 text-sm font-bold px-4 py-2 rounded-full uppercase tracking-widest border border-red-200">
            Role: {userRole}
          </span>
        </div>

        {activeTab === 'dashboard' && (
          <div className="animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-8 rounded-2xl shadow-sm border-b-4 border-red-500 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Pendapatan Asli</p>
                <p className="text-4xl font-bold text-gray-800">Rp {stats.revenue.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border-b-4 border-green-500 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Pesanan Selesai</p>
                <p className="text-4xl font-bold text-gray-800">{stats.completed} Pesanan</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border-b-4 border-blue-500 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Menu Paling Laku</p>
                <p className="text-3xl font-bold text-gray-800 truncate capitalize">{stats.bestSeller}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg text-gray-800 mb-6">📈 Grafik Pendapatan Harian</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueChart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="tanggal" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} tickFormatter={(value) => `Rp ${value / 1000}k`} />
                      <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} labelStyle={{fontWeight: 'bold', color: '#1f2937'}} cursor={{stroke: '#fca5a5', strokeWidth: 2}} />
                      <Legend />
                      <Line type="monotone" name="Pendapatan (Rp)" dataKey="pendapatan" stroke="#ef4444" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} animationDuration={1500} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg text-gray-800 mb-6">📊 Roti Paling Banyak Dipesan</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={menuChart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="namaRoti" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip cursor={{fill: '#f3f4f6'}} />
                      <Legend />
                      <Bar dataKey="terjual" name="Total Porsi Terjual" fill="#3b82f6" radius={[6, 6, 0, 0]} animationDuration={1500} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="flex flex-col lg:flex-row gap-8 animate-fadeIn">
            <div className="w-full lg:w-1/3 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit sticky top-10">
              <h3 className="font-bold text-2xl mb-6 text-red-800 font-serif">Buat Roti Baru</h3>
              <form onSubmit={handleCreateFood} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Nama Roti</label>
                  <input name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-red-500" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Deskripsi</label>
                  <textarea name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-red-500 h-24 resize-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Harga (Rp)</label>
                  <input name="price" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-red-500" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Upload Foto</label>
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
                </div>
                <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-xl font-bold shadow-md hover:bg-red-700 transition-transform hover:scale-[1.02]">Panggang & Masukkan Etalase!</button>
              </form>
            </div>
            <div className="w-full lg:w-2/3">
              <h3 className="font-bold text-2xl mb-6 text-gray-800 font-serif">Daftar Roti di Etalase ({foods.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {foods.map(food => (
                  <div key={food.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                    <img src={food.image_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80"} className="w-full h-48 object-cover rounded-xl mb-4" />
                    <h4 className="font-bold text-xl capitalize text-gray-800">{food.name}</h4>
                    <p className="text-red-600 font-bold mb-3 text-lg">Rp {food.price?.toLocaleString('id-ID')}</p>
                    <p className="text-sm text-gray-500 mb-6 flex-grow line-clamp-3">{food.description}</p>
                    <button onClick={() => handleDeleteFood(food.id)} className="w-full bg-red-50 text-red-600 py-3 rounded-xl text-sm font-bold border border-red-100 hover:bg-red-100 transition-colors">🗑️ Hapus Menu</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;