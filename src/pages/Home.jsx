import { useEffect, useState } from 'react';
import { getAllFoods, createFood, deleteFood } from '../services/foodService';
import { Link } from 'react-router-dom';

function Home() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // MANTRA GAIB 1: MEMBACA JABATAN
  const userRole = localStorage.getItem('role') || 'pembeli';

  // ==========================================
  // FITUR KERANJANG (DENGAN INGATAN ABADI)
  // ==========================================
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('crumb_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // ==========================================
  // STATE METODE PEMESANAN (O2O)
  // ==========================================
  const [cartMethod, setCartMethod] = useState('pickup'); 
  const [deliveryAddress, setDeliveryAddress] = useState(''); 
  const [pickupTime, setPickupTime] = useState(''); 

  useEffect(() => {
    localStorage.setItem('crumb_cart', JSON.stringify(cart));
  }, [cart]);

  // ==========================================
  // State khusus untuk Formulir Tambah Menu
  // ==========================================
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', price: '' });
  const [imageFile, setImageFile] = useState(null); 

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const data = await getAllFoods();
      setFoods(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal memuat makanan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const addToCart = (food) => {
    setCart([...cart, food]);
  };

  const removeFromCart = (indexToRemove) => {
    const newCart = [...cart];
    newCart.splice(indexToRemove, 1);
    setCart(newCart);
  };

  const cartTotal = cart.reduce((total, item) => total + parseInt(item.price || 0), 0);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]); 
  };

  const handleCreateFood = async (e) => {
    e.preventDefault(); 
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      
      if (imageFile) {
        submitData.append('image', imageFile); 
      }

      await createFood(submitData);
      
      alert("Menu baru berhasil dipanggang & ditambahkan! 🥖");
      setShowForm(false); 
      setFormData({ name: '', description: '', price: '' }); 
      setImageFile(null);
      fetchFoods(); 
    } catch (error) {
      alert("Gagal menambah menu. Pastikan Backend jalan & Token aman!");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Yakin ingin menghapus roti ini dari menu selamanya?");
    if (confirmDelete) {
      try {
        await deleteFood(id);
        setFoods(foods.filter((food) => food.id !== id));
      } catch (error) {
        alert("Gagal menghapus menu.");
      }
    }
  };

  if (loading) return <div className="min-h-screen bg-crumb-cream flex items-center justify-center text-crumb-maroon font-serif text-2xl animate-pulse">Memanggang data...</div>;

  return (
    <div className="min-h-screen bg-crumb-cream font-sans text-crumb-text relative overflow-x-hidden">
      
      {/* NAVBAR VERSI 2.0 (ULTRA MINIMALIS) */}
      <nav className="bg-crumb-maroon text-crumb-cream py-4 px-8 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <h1 className="text-2xl font-serif tracking-widest font-bold cursor-pointer">SA BAKERY</h1>
        
        {/* Trik: Di tengah sekarang cuma tersisa MENU */}
        <ul className="hidden md:flex text-sm uppercase tracking-wider">
          <li className="cursor-pointer border-b-2 border-crumb-cream pb-1 font-bold tracking-widest">Menu</li>
        </ul>
        
        {/* BARISAN TOMBOL KANAN */}
        <div className="flex space-x-3 md:space-x-4 items-center">
          
          {/* 1. Label Pangkat (Efek Kaca Frosted) */}
          <span className="text-xs bg-white/10 text-crumb-cream px-3 py-1.5 rounded-full font-bold uppercase tracking-wider border border-crumb-cream/20 hidden sm:inline-block">
            {userRole}
          </span>

          {/* 2. Tombol Profil Baru (Samping Keranjang) */}
          <Link 
            to="/profile" 
            className="flex items-center space-x-1.5 bg-crumb-cream text-crumb-maroon px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="text-sm">👤</span>
            <span className="hidden sm:inline font-extrabold">Profil</span>
          </Link>

          {/* 3. Tombol Keranjang */}
          <button onClick={() => setIsCartOpen(true)} className="relative hover:scale-110 transition-transform cursor-pointer p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-crumb-maroon text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow">
                {cart.length}
              </span>
            )}
          </button>

        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="bg-crumb-maroon text-crumb-cream text-center py-20 px-4">
        <h2 className="text-5xl md:text-7xl font-serif mb-4">SA BAKERY</h2>
        <p className="max-w-2xl mx-auto text-sm md:text-base font-light italic opacity-90">
          At SA BAKERY, we turn butter, flour, and a little chaos into perfect pastries. Flaky, golden, and delightfully imperfect — each bite is a tiny experiment in happiness.
        </p>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto py-16 px-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center flex-grow">
            <h3 className="text-3xl font-serif text-crumb-maroon mr-4">BEST SELLERS</h3>
            <div className="flex-grow border-t border-crumb-maroon opacity-50 mr-4"></div>
          </div>
          
          {/* MANTRA GAIB 2: MENYEMBUNYIKAN TOMBOL TAMBAH MENU */}
          {userRole === 'owner' && (
            <button 
              onClick={() => setShowForm(true)}
              className="bg-crumb-maroon text-crumb-cream px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-red-900 transition-colors shadow-lg flex-shrink-0"
            >
              + Tambah Menu
            </button>
          )}
        </div>

        {foods.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-crumb-border rounded-xl">
            <p className="text-xl font-serif text-crumb-maroon mb-2">Etalase masih kosong.</p>
            <p className="text-sm opacity-70">Klik tombol "Tambah Menu" di atas untuk memajang roti pertamamu!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {foods.map((food) => (
              <div key={food.id} className="flex flex-col items-center group relative">
                <div className="bg-[#dfb598] w-full aspect-square rounded-2xl flex items-center justify-center p-4 mb-4 shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
                  <img src={food.image_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80"} alt={food.name} className="object-cover w-full h-full rounded-xl mix-blend-multiply hover:scale-110 transition-transform duration-500" />
                  
                  {/* MANTRA GAIB 3: MENYEMBUNYIKAN TONG SAMPAH HAPUS MENU */}
                  {userRole === 'owner' && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button onClick={() => handleDelete(food.id)} className="bg-white p-2 rounded-full shadow-lg text-red-600 hover:bg-red-100 transition-colors" title="Hapus Menu">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  )}
                </div>
                
                <h4 className="border border-crumb-maroon text-crumb-maroon px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 text-center">{food.name}</h4>
                <p className="text-xs text-center mb-3 px-2 opacity-80 line-clamp-2 min-h-[2rem]">{food.description}</p>
                <p className="font-bold text-crumb-maroon mb-4">Rp {food.price?.toLocaleString('id-ID')}</p>
                <button onClick={() => addToCart(food)} className="w-full bg-crumb-maroon text-white py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-red-900 transition-colors shadow-md">Add to Cart</button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* POP-UP FORMULIR TAMBAH MENU */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-crumb-cream p-8 rounded-2xl max-w-md w-full shadow-2xl border-2 border-crumb-maroon relative">
            <h2 className="text-3xl font-serif text-crumb-maroon mb-6 text-center border-b border-crumb-border pb-4">Bikin Menu Baru</h2>
            <form onSubmit={handleCreateFood} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-crumb-maroon mb-1">Nama Roti</label>
                <input name="name" value={formData.name} onChange={handleInputChange} className="w-full p-3 border border-crumb-border rounded-lg bg-white focus:outline-none focus:border-crumb-maroon" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-crumb-maroon mb-1">Deskripsi</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full p-3 border border-crumb-border rounded-lg bg-white focus:outline-none focus:border-crumb-maroon h-20 resize-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-crumb-maroon mb-1">Harga (Rp)</label>
                <input name="price" type="number" value={formData.price} onChange={handleInputChange} className="w-full p-3 border border-crumb-border rounded-lg bg-white focus:outline-none focus:border-crumb-maroon" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-crumb-maroon mb-1">Upload Foto</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2 border border-dashed border-crumb-maroon rounded-lg bg-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-crumb-maroon file:text-white hover:file:bg-red-900 cursor-pointer" />
              </div>
              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="w-1/2 py-3 rounded-lg text-sm font-bold uppercase border border-crumb-maroon text-crumb-maroon hover:bg-red-50">Batal</button>
                <button type="submit" className="w-1/2 bg-crumb-maroon text-white py-3 rounded-lg text-sm font-bold uppercase shadow-md hover:bg-red-900">Panggang!</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIDEBAR KERANJANG BELANJA */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-crumb-cream h-full shadow-2xl p-6 flex flex-col transform translate-x-0 transition-transform">
            
            <div className="flex justify-between items-center border-b border-crumb-maroon pb-4 mb-4">
              <h2 className="text-2xl font-serif text-crumb-maroon">Keranjangmu 🛒</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-red-600 text-3xl cursor-pointer">&times;</button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
              {cart.length === 0 ? (
                <p className="text-center text-sm opacity-70 mt-10">Keranjang masih kosong. Yuk pilih rotinya!</p>
              ) : (
                <>
                  <div className="bg-white p-4 rounded-xl border border-crumb-border mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-crumb-maroon mb-3">Metode Pemesanan:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${cartMethod === 'pickup' ? 'border-crumb-maroon bg-red-50 text-crumb-maroon font-bold' : 'border-gray-200 bg-white opacity-70'}`}>
                        <input type="radio" name="orderMethod" value="pickup" checked={cartMethod === 'pickup'} onChange={() => setCartMethod('pickup')} className="sr-only" />
                        <span className="text-lg">🛍️</span>
                        <span className="text-xs mt-1">Ambil di Toko</span>
                      </label>
                      <label className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${cartMethod === 'delivery' ? 'border-crumb-maroon bg-red-50 text-crumb-maroon font-bold' : 'border-gray-200 bg-white opacity-70'}`}>
                        <input type="radio" name="orderMethod" value="delivery" checked={cartMethod === 'delivery'} onChange={() => setCartMethod('delivery')} className="sr-only" />
                        <span className="text-lg">🛵</span>
                        <span className="text-xs mt-1">Kirim ke Rumah</span>
                      </label>
                    </div>

                    {cartMethod === 'delivery' && (
                      <div className="mt-4 pt-4 border-t border-dashed border-gray-200 animate-fadeIn">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-crumb-maroon mb-1">Alamat Lengkap Pengiriman</label>
                        <textarea placeholder="Masukkan alamat rumah, nomor blok..." value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="w-full p-2 text-xs border border-crumb-border rounded-lg bg-crumb-cream focus:outline-none focus:border-crumb-maroon h-16 resize-none" />
                      </div>
                    )}

                    {cartMethod === 'pickup' && (
                      <div className="mt-4 pt-4 border-t border-dashed border-gray-200 animate-fadeIn">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-crumb-maroon mb-1">Estimasi Jam Pengambilan</label>
                        <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-full p-2 text-xs border border-crumb-border rounded-lg bg-crumb-cream focus:outline-none focus:border-crumb-maroon" />
                      </div>
                    )}
                  </div>

                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-crumb-border">
                      <div className="flex items-center space-x-3">
                        <img src={item.image_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=100&q=80"} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
                        <div>
                          <h5 className="font-bold text-sm text-crumb-maroon">{item.name}</h5>
                          <p className="text-xs opacity-80">Rp {item.price?.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(index)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-md" title="Hapus"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="border-t border-crumb-border pt-4 mt-4">
              <div className="flex justify-between items-center mb-4 text-xl font-bold text-crumb-maroon">
                <span>Total:</span>
                <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
              </div>
              <button 
                className="w-full bg-crumb-maroon text-white py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-red-900 transition-colors shadow-lg disabled:opacity-50 cursor-pointer"
                disabled={cart.length === 0 || (cartMethod === 'delivery' && !deliveryAddress) || (cartMethod === 'pickup' && !pickupTime)}
                onClick={async () => { 
                  // 👇 KONEKSIKAN KE BACKEND 👇
                  try {
                    const token = localStorage.getItem('token');
                    if (!token) return alert("Kamu harus Login dulu sebelum pesan roti!");

                    const response = await fetch('http://localhost:5000/api/orders', {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                      },
                      body: JSON.stringify({
                        orderMethod: cartMethod,
                        deliveryAddress: cartMethod === 'delivery' ? deliveryAddress : `Ambil di Toko (Jam: ${pickupTime})`,
                        items: cart // Kirim isi keranjang
                      })
                    });

                    const data = await response.json();
                    if (data.success) {
                      alert("YEAY! Pesananmu sudah masuk ke Dapur Kasir! 👨‍🍳🥐");
                      setIsCartOpen(false); 
                      setCart([]); // Kosongkan keranjang
                      setDeliveryAddress('');
                      setPickupTime('');
                    } else {
                      alert("Gagal memproses pesanan: " + data.message);
                    }
                  } catch (error) {
                    alert("Gagal koneksi ke server Kasir.");
                  }
                }}
              >
                Checkout Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;