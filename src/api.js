import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

export const getHouses = () => api.get('/houses');
export const addHouse = (house) => api.post('/houses', house);
export const updateHouse = (id, house) => api.put(`/houses/${id}`, house);
export const deleteHouse = (id) => api.delete(`/houses/${id}`);

// Rentals
export const rentHouse = (rental) => api.post('/rentals', rental);
export const getRentals = () => api.get('/rentals');