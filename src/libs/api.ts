import axios from "axios";


const api = axios.create({
  baseURL: "https://circle-be-gules.vercel.app/api",
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("Sending Token:", token); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api };
