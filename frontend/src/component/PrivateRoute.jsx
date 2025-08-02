import React from "react";
import { Navigate } from "react-router-dom";


const PrivateRoute = ({ isAuthenticated, userRole, allowedRoles, children }) => {
    if (!isAuthenticated) {
        return <Navigate to="/" />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;