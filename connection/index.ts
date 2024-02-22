import axios from "axios";
import { parseCookies } from "nookies";
const connection = axios.create({
  baseURL: "/api",
});

connection.interceptors.request.use((config) => {
  const { token } = parseCookies();
  config.headers.Authorization = token;
  return config;
});

export default connection;
