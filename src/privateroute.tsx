
import React from "react";
import { Navigate } from "react-router-dom";
import { useStore } from "@/useStore";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  console.log("PrivateRoute - isAuthenticated:", isAuthenticated);

  // Redirect unauthenticated users to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Allow access if authenticated
  return <>{children}</>;
};

export default PrivateRoute;


