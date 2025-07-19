import axios from 'axios';

const API_BASE = '/api/products';

export async function getProducts(page = 1, pageSize = 10, category?: string) {
  const params: any = { page, page_size: pageSize };
  if (category) params.category = category;
  const res = await axios.get(API_BASE, { params });
  return res.data;
}
export async function updateProduct(id: number, data: { name: string; description: string; price: number }) {
  const response = await axios.put(`${API_BASE}/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: number) {
  const response = await axios.delete(`${API_BASE}/${id}`);
  return response.data;
}