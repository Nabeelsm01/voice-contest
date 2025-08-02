import { Navigate } from "react-router-dom";

const AdminRoute = ({ isAuthenticated, userRole, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (userRole !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
