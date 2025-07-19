import axios from 'axios';

const API_BASE = '/api/services';

export async function getServices(page = 1, pageSize = 10, category?: string) {
  const params: any = { page, page_size: pageSize };
  if (category) params.category = category;
  const res = await axios.get(API_BASE, { params });
  return res.data;
}