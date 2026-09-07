import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { Toaster } from "sonner";

// Page imports
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import Home from "./pages/Home/Home";
import AdminLogin from "./pages/LoginPage/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import EditUser from "./pages/Admin/EditUser";
import NewUserModal from "./pages/Admin/NewUserModal";
import EditUserProfile from "./components/profile/EditUserProfile";

// Route guards
import {
  AdminRoute,
  AdminPublic,
  PrivateRoute,
  PublicRoute,
} from "./routes/routes";

function App() {
  return (
    <Provider store={store}>
      <Toaster position="top-right" richColors />
      <Router>
        <Routes>
          {/* Public User Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/user/login"
            element={<Navigate to="/" replace />}
          />
          <Route
            path="/user/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected User Routes */}
          <Route
            path="/user/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/edit-profile"
            element={
              <PrivateRoute>
                <EditUserProfile />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/login"
            element={
              <AdminPublic>
                <AdminLogin />
              </AdminPublic>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/edit-user/:id"
            element={
              <AdminRoute>
                <EditUser />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/add-new-user"
            element={
              <AdminRoute>
                <NewUserModal />
              </AdminRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
