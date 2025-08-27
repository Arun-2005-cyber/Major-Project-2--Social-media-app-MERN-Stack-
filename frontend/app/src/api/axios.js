import axios from "axios";

const API = axios.create({
  baseURL: "https://major-project-2-social-media-app-mern.onrender.com", 
  withCredentials: true, // important if using cookies/session
});

export default API;
