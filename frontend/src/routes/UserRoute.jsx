import { Navigate } from "react-router-dom";

const UserRoute = ({ isAuthenticated, userRole, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (userRole !== "user") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default UserRoute;
