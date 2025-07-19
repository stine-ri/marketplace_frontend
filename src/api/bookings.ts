import axios from 'axios';

const API_BASE = '/api/bookings';

export async function getBookings(page = 1, pageSize = 10) {
  const res = await axios.get(API_BASE, { params: { page, page_size: pageSize } });
  return res.data;
}

export async function getBookingById(id: number) {
  const res = await axios.get(`${API_BASE}/${id}`);
  return res.data;
}

export async function createBooking(data: { user_id: number; service_id: number; booking_date: string }) {
  const res = await axios.post(API_BASE, data);
  return res.data;
}

export async function updateBooking(id: number, data: { booking_date: string }) {
  const res = await axios.put(`${API_BASE}/${id}`, data);
  return res.data;
}

export async function deleteBooking(id: number) {
  const res = await axios.delete(`${API_BASE}/${id}`);
  return res.data;
}