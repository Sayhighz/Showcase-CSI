import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spin } from "antd"; // Ant Design loading spinner

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Show a loading spinner while checking authentication status
  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Render the protected page
  return children;
};

export default ProtectedRoute;
