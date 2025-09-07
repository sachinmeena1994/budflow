
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Default to a standard user role if none is defined
  const userRole = user?.role || "user";
  
  // Redirect to productivity if authenticated, otherwise to login page
  return isAuthenticated ? <Navigate to="/productivity" replace /> : <Navigate to="/login" replace />;
};

export default Index;
