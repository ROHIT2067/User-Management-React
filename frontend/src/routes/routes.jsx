import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export function AdminRoute({ children }) {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/" />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/user/login" />;
  }
  return children;
}

export function AdminPublic({ children }) {
  const { user } = useSelector((state) => state.auth);

  return user ? <Navigate to="/admin/dashboard" replace /> : children ;
}

export function PrivateRoute({ children }) {
  const { user } = useSelector((state) => state.auth);

  return user ? children : <Navigate to="/" replace />;
}

export function PublicRoute({ children }) {
  const { user } = useSelector((state) => state.auth);

  return user ? <Navigate to="/user/home" replace /> : children ;
}
