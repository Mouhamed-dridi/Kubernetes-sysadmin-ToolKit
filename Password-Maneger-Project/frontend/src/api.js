import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

export function setToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export const register = (username, password) => api.post('/register', { username, password });
export const login = (username, password) => api.post('/login', { username, password });
export const logout = () => api.post('/logout');
export const getMe = () => api.get('/me');
export const getPasswords = () => api.get('/passwords');
export const uploadPasswords = (items) => api.post('/upload', { items });
export const decryptField = (encryptedText) => api.post('/decrypt', { encryptedText });
export const resetData = () => api.post('/reset');
export const updateProfile = (username) => api.post('/update-profile', { username });
export const changePassword = (currentPassword, newPassword) => api.post('/change-password', { currentPassword, newPassword });
export const uploadAvatar = (avatar) => api.post('/upload-avatar', { avatar });
export const getUsers = () => api.get('/admin/users');
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getConfig = () => api.get('/admin/config');
export const updateConfig = (key, value) => api.post('/admin/config', { key, value });
export const getUserCount = () => api.get('/users/count');

export default api;
