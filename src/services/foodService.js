import API from './api';

// 1. READ: Mengambil semua menu
export const getAllFoods = async () => {
  try {
    // 🔥 UBAH: Tambahkan /api di depan /foods
    const response = await API.get('/api/foods'); 
    return response.data.data.foods; 
  } catch (error) {
    console.error("Error fetching foods:", error);
    throw error;
  }
};

// 2. CREATE: Menambah menu baru dari web (pengganti Postman)
export const createFood = async (foodData) => {
  try {
    // 🔥 UBAH: Tambahkan /api di depan /foods
    const response = await API.post('/api/foods', foodData);
    return response.data;
  } catch (error) {
    console.error("Error creating food:", error);
    throw error;
  }
};

// 3. DELETE: Menghapus menu
export const deleteFood = async (id) => {
  try {
    // 🔥 UBAH: Tambahkan /api di depan /foods
    const response = await API.delete(`/api/foods/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting food:", error);
    throw error;
  }
};