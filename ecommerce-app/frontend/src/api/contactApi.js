import axiosInstance from './axiosInstance';

export async function submitContact({ name, email, message }) {
  const envelope = await axiosInstance.post('/contact', { name, email, message });
  return envelope.data;
}

export async function subscribe({ email }) {
  const envelope = await axiosInstance.post('/contact/subscribe', { email });
  return envelope.data;
}
