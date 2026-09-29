import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('khojhub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle token expiration or unauthenticated responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('khojhub_token');
        localStorage.removeItem('khojhub_user');
      }
    }
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
};

export const itemsApi = {
  getPublicItems: (params) => api.get('/items', { params }),
  getItemById: (id) => api.get(`/items/${id}`),
  createFoundItem: (data) => api.post('/items/found', data),
  createLostItem: (data) => api.post('/items/lost', data),
  reportFoundMatch: (lostItemId, data) => api.post(`/items/${lostItemId}/found-response`, data),
  getMyPosts: () => api.get('/items/my-posts'),
  deleteItem: (id) => api.delete(`/items/${id}`),
};

export const claimsApi = {
  submitClaim: (itemId, data) => api.post(`/items/${itemId}/claims`, data),
  getMyClaims: () => api.get('/claims/my'),
  getClaimById: (id) => api.get(`/claims/${id}`),
  getItemClaims: (itemId) => api.get(`/items/${itemId}/claims`),
  confirmOwner: (claimId) => api.post(`/claims/${claimId}/confirm`),
  rejectClaim: (claimId, reason) => api.post(`/claims/${claimId}/reject`, null, { params: { reason } }),
};

export const chatsApi = {
  getMyConversations: () => api.get('/chats/my'),
  getMessages: (conversationId) => api.get(`/chats/${conversationId}/messages`),
  sendMessage: (conversationId, message) => api.post(`/chats/${conversationId}/send`, { message }),
};

export const custodyApi = {
  getStoredItems: () => api.get('/custody/stored'),
  completeHandover: (data) => api.post('/custody/handover', data),
};

export const rewardsApi = {
  processReward: (data) => api.post('/rewards', data),
  getMyRewards: () => api.get('/rewards/my'),
};

export const notificationsApi = {
  getNotifications: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const adminApi = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getPendingItems: () => api.get('/admin/items/pending'),
  approveItem: (id) => api.post(`/admin/items/${id}/approve`),
  rejectItem: (id, reason) => api.post(`/admin/items/${id}/reject`, { reason }),
  getAllItems: () => api.get('/admin/items'),
  getReturnedItems: () => api.get('/admin/items/returned'),
  getUsers: () => api.get('/admin/users'),
  toggleUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, null, { params: { status } }),
  getCustodyRecords: () => api.get('/admin/custody'),
  getAllRewards: () => api.get('/admin/rewards'),
  getAuditLogs: (limit = 50) => api.get('/admin/audit-logs', { params: { limit } }),
};

export const filesApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
