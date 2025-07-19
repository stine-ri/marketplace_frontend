import axios from 'axios';

const API_BASE = '/api/admin';

export async function getAdmins() {
  const res = await axios.get(API_BASE);
  return res.data;
}

export async function getAdminById(id: number) {
  const res = await axios.get(`${API_BASE}/${id}`);
  return res.data;
}

export async function createAdmin(data: { username: string; role: string }) {
  const res = await axios.post(API_BASE, data);
  return res.data;
}

export async function updateAdmin(id: number, data: { role: string }) {
  const res = await axios.put(`${API_BASE}/${id}`, data);
  return res.data;
}

export async function deleteAdmin(id: number) {
  const res = await axios.delete(`${API_BASE}/${id}`);
  return res.data;
}