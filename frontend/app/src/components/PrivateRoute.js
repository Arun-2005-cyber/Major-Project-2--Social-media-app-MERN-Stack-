import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const userInfo = localStorage.getItem("userInfo");

  // If no user, redirect instantly (no flicker)
  if (!userInfo) {
    return <Navigate to="/signup" replace />;
  }

  return children; // show page if logged in
};

export default PrivateRoute;
