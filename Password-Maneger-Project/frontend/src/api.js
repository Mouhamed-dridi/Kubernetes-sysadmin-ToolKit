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

export const register = (username, password) => api.post('/auth/register', { username, password });
export const login = (username, password) => api.post('/auth/login', { username, password });
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const getPasswords = () => api.get('/vault');
export const uploadPasswords = (items) => api.post('/vault/upload', { items });
export const decryptField = (encryptedText) => api.post('/vault/decrypt', { encryptedText });
export const updateProfile = (username) => api.put('/profile', { username });
export const changePassword = (currentPassword, newPassword) => api.put('/profile/password', { currentPassword, newPassword });
export const uploadAvatar = (avatar) => api.put('/profile/avatar', { avatar });
export const getUserCount = () => api.get('/system/count');
export const resetData = () => api.post('/system/reset');
export const getUsers = () => api.get('/admin/users');
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getConfig = () => api.get('/admin/config');
export const updateConfig = (key, value) => api.put('/admin/config', { key, value });

export default api;
