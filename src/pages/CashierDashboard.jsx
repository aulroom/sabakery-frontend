import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api'; // Pastikan path ini mengarah ke file api.js 

function CashierDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // State untuk menyimpan daftar ID pesanan yang sudah DI-ARSIPKAN oleh kasir
  const [archivedOrders, setArchivedOrders] = useState(() => {
    const saved = localStorage.getItem('cashier_archived_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const fetchOrders = async () => {
    try {
      const response = await API.get('/api/orders'); // Sesuaikan endpoint dengan yang ada di backend
      const data = response.data;
      
      if (data.success) {
        // Ambil list arsip terbaru langsung dari localStorage untuk keakuratan
        const currentArchived = JSON.parse(localStorage.getItem('cashier_archived_orders') || '[]');

        // Kasir melihat pesanan yang belum dibatalkan DAN belum di-arsipkan manual oleh kasir
        const activeOrders = data.data.orders.filter(
          order => order.status !== 'cancelled' && !currentArchived.includes(order.id)
        );
        setOrders(activeOrders);

        // Supaya data di panel kanan otomatis ikut berubah secara real-time saat disegarkan
        // (Catatan: karena kita pakai useEffect [], jika panel kanan tidak mau auto-update
        // saat interval jalan, kamu bisa gunakan pendekatan useRef nanti. Tapi untuk
        // menghentikan error interval, ini sudah aman).
        setSelectedOrder((prevSelected) => {
            if (prevSelected) {
                const updatedSelected = activeOrders.find(o => o.id === prevSelected.id);
                return updatedSelected || null;
            }
            return prevSelected;
        });
      }
    } catch (error) {
      console.error("Gagal load antrian kasir:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(); // Panggil sekali saat halaman dimuat
    const interval = setInterval(fetchOrders, 5000); // Interval jalan sendiri tiap 5 detik
    return () => clearInterval(interval);
  }, []); // <--- PERBAIKAN: ARRAY SUDAH DIKOSONGKAN DI SINI!

  const updateStatus = async (orderId, newStatus) => {
    try {
      const response = await API.put(`/api/orders/${orderId}/status`, {
        status: newStatus 
      });
      
      if (response.data) {
        fetchOrders();
      }
    } catch (error) {
      alert("Gagal mengubah status!");
    }
  };

  // FUNGSI: KASIR MEMBERSIHKAN NOTA SETELAH PEMBELI MENERIMA BARANG
  const handleArchiveOrder = (orderId) => {
    const updatedArchived = [...archivedOrders, orderId];
    setArchivedOrders(updatedArchived);
    localStorage.setItem('cashier_archived_orders', JSON.stringify(updatedArchived));
    setSelectedOrder(null); // Tutup nota kanan
    fetchOrders(); // Segarkan antrian kiri
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl bg-red-900 text-white">Membuka Mesin Kasir...</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex font-sans">
      
      {/* PANEL KIRI: DAFTAR ANTRIAN */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col shadow-xl z-10">
        <div className="bg-red-900 text-white p-6 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold tracking-widest">SA BAKERY CASHIER</h1>
          <button onClick={handleLogout} className="text-xs border border-white px-3 py-1.5 rounded-full hover:bg-white hover:text-red-900 transition-colors font-bold">
            Tutup Kasir
          </button>
        </div>
        
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-bold text-gray-700">Antrian Masuk ({orders.length})</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {orders.length === 0 ? (
            <p className="text-center text-gray-400 text-sm mt-10 italic">Tidak ada antrian aktif...</p>
          ) : (
            orders.map(order => (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedOrder?.id === order.id ? 'border-red-900 bg-red-50 shadow-md scale-[1.02]' : 'border-gray-100 bg-white hover:border-red-300'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-gray-500 uppercase tracking-widest">{order.order_number}</span>
                  {order.status === 'pending' && <span className="bg-yellow-100 text-yellow-800 text-[10px] font-extrabold px-2 py-1 rounded">BARU</span>}
                  {order.status === 'preparing' && <span className="bg-orange-100 text-orange-800 text-[10px] font-extrabold px-2 py-1 rounded animate-pulse">DIPANGGANG</span>}
                  {order.status === 'delivering' && <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-1 rounded">DIANTAR</span>}
                  {order.status === 'delivered' && <span className="bg-green-500 text-white text-[10px] font-extrabold px-2 py-1 rounded shadow-sm shadow-green-500/50">DITERIMA PEMBELI!</span>}
                </div>
                
                {/* 👇 MENAMPILKAN NAMA PEMBELI DI ANTRIAN KIRI 👇 */}
                <p className="text-sm font-bold text-gray-800 truncate capitalize">
                  👤 {order.buyer?.full_name || order.buyer?.username || 'Pelanggan'}
                </p>
                <p className="text-xs text-gray-500 truncate mt-1">📍 {order.delivery_address}</p>
                <p className="text-sm font-bold text-red-900 mt-2">Rp {parseInt(order.total).toLocaleString('id-ID')}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PANEL KANAN: DETAIL PESANAN & KONTROL HAK HAK KASIR */}
      <div className="flex-1 bg-[#FDFBF7] flex flex-col overflow-y-auto">
        {selectedOrder ? (
          <div className="p-10 max-w-4xl mx-auto w-full animate-fadeIn pb-20">
            <h2 className="text-3xl font-serif text-red-900 mb-6 border-b-2 border-red-100 pb-4 flex justify-between items-end">
              <span>Nota {selectedOrder.order_number}</span>
              <span className="text-sm text-gray-500 font-sans">{new Date(selectedOrder.created_at).toLocaleString('id-ID')}</span>
            </h2>

            {/* 👇 KOTAK INFORMASI PEMESAN (NAMA & NO HP) 👇 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Informasi Pemesan</p>
                <p className="font-bold text-xl text-gray-800 capitalize">
                  👤 {selectedOrder.buyer?.full_name || selectedOrder.buyer?.username || 'Pelanggan'}
                </p>
                <p className="text-sm text-gray-500 mt-1 font-mono">
                  📞 {selectedOrder.buyer?.phone || 'Tidak ada No. HP'}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Penerimaan / Pengiriman</p>
                <p className="font-bold text-xl text-gray-800">📍 {selectedOrder.delivery_address}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedOrder.delivery_address === 'Ambil di Toko' ? 'Harap siapkan bungkusan untuk diambil.' : 'Siapkan untuk diserahkan ke Kurir/Ojol.'}
                </p>
              </div>
            </div>

            {/* KOTAK DAFTAR ROTI */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-8">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Daftar Belanjaan:</p>
              <div className="space-y-4 mb-8">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-dashed border-gray-200 pb-2">
                    <span className="font-bold text-gray-800 text-lg">{item.quantity}x {item.food_name}</span>
                    <span className="text-gray-600 font-bold">Rp {parseInt(item.subtotal).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
              <div className="bg-red-50 p-4 rounded-xl flex justify-between items-center border border-red-100">
                <span className="font-bold text-red-900 tracking-widest">TOTAL DIBAYAR:</span>
                <span className="text-3xl font-bold text-red-900">Rp {parseInt(selectedOrder.total).toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* PANEL KONTROL KASIR SINKRONISASI PEMBELI */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Pusat Informasi Operasional</p>
              
              <div className="flex gap-4">
                {/* 1. JIKA STATUS PENDING */}
                {selectedOrder.status === 'pending' && (
                  <button onClick={() => updateStatus(selectedOrder.id, 'preparing')} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/20 transition-transform hover:scale-105">
                    👨‍🍳 MULAI PANGGANG (PREPARING)
                  </button>
                )}

                {/* 2. JIKA STATUS PREPARING */}
                {selectedOrder.status === 'preparing' && (
                  <button onClick={() => updateStatus(selectedOrder.id, 'delivering')} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-transform hover:scale-105">
                    🛵 SERAHKAN KE KURIR / SIAP DIAMBIL
                  </button>
                )}

                {/* 3. JIKA STATUS DELIVERING (KASIR MENUNGGU PEMBELI KLIK TERIMA) */}
                {selectedOrder.status === 'delivering' && (
                  <div className="w-full bg-blue-50 border border-blue-200 p-6 rounded-xl text-center">
                    <span className="text-3xl animate-bounce inline-block mb-2">🛵</span>
                    <h4 className="font-bold text-blue-900 text-lg">Roti dalam Perjalanan / Menunggu Diambil</h4>
                    <p className="text-xs text-blue-600 mt-1">Sistem sedang menunggu Pembeli <b>({selectedOrder.buyer?.full_name || selectedOrder.buyer?.username || 'Pelanggan'})</b> menekan tombol "Pesanan Diterima" di HP mereka.</p>
                  </div>
                )}

                {/* 4. TAHAP EMAS: JIKA STATUS DELIVERED (PEMBELI SUDAH KLIK TERIMA BARANG!) */}
                {selectedOrder.status === 'delivered' && (
                  <div className="w-full bg-green-50 border border-green-200 p-6 rounded-xl text-center space-y-4">
                    <span className="text-4xl">🎉</span>
                    <h4 className="font-bold text-green-900 text-xl">PESANAN SUDAH DITERIMA!</h4>
                    <p className="text-sm text-green-700"><b>{selectedOrder.buyer?.full_name || selectedOrder.buyer?.username || 'Pelanggan'}</b> telah mengonfirmasi barang diterima dengan aman.</p>
                    <button 
                      onClick={() => handleArchiveOrder(selectedOrder.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-md shadow-md shadow-green-600/20 transition-transform hover:scale-105"
                    >
                      🗄️ Arsipkan & Bersihkan dari Antrian Aktif
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-50">
            <span className="text-6xl mb-4">👇</span>
            <p className="text-xl font-bold text-gray-500">Klik salah satu antrian di sebelah kiri untuk melihat rincian nota</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CashierDashboard;