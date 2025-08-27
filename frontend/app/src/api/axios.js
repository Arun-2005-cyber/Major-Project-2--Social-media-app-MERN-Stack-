import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // will take from .env
});

export default API;
// export default axios;