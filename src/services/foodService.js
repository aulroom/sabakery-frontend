import API from './api';

// 1. READ: Mengambil semua menu
export const getAllFoods = async () => {
  try {
    const response = await API.get('/foods'); 
    return response.data.data.foods; 
  } catch (error) {
    console.error("Error fetching foods:", error);
    throw error;
  }
};

// 2. CREATE: Menambah menu baru dari web (pengganti Postman)
export const createFood = async (foodData) => {
  try {
    const response = await API.post('/foods', foodData);
    return response.data;
  } catch (error) {
    console.error("Error creating food:", error);
    throw error;
  }
};

// 3. DELETE: Menghapus menu
export const deleteFood = async (id) => {
  try {
    const response = await API.delete(`/foods/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting food:", error);
    throw error;
  }
};