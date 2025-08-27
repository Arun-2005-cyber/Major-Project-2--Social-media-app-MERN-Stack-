import axios from "axios";

const API = axios.create({
  baseURL: "https://major-project-2-social-media-app-mern.onrender.com", // will take from .env
});

export default API;
// export default axios;