import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const submitComplaintAPI = async (payload) => {
  const response = await api.post('/complaints/submit', payload);
  return response.data;
};

export const getComplaintsAPI = async (filters = {}) => {
  const response = await api.get('/complaints/', { params: filters });
  return response.data;
};

export const getComplaintDetailAPI = async (complaintId) => {
  const response = await api.get(`/complaints/${complaintId}`);
  return response.data;
};

export const updateComplaintStatusAPI = async (complaintId, payload) => {
  const response = await api.put(`/complaints/${complaintId}/status`, payload);
  return response.data;
};

export const getAnalyticsOverviewAPI = async () => {
  const response = await api.get('/analytics/overview');
  return response.data;
};

export const queryRAGKnowledgeAPI = async (query) => {
  const response = await api.post('/rag/query', { query });
  return response.data;
};
