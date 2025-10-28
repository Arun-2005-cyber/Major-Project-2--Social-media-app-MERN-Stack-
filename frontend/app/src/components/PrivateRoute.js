import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  // If no user, redirect instantly (no flicker)
  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  return children; // show page if logged in
};

export default PrivateRoute;
