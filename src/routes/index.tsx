import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Dashboard from "../components/pages/Dashboard/Dashboard";
import History from "../components/pages/History/History";
import Camera from "../components/pages/Camera";
import Login from "../components/pages/Login";
import Register from "../components/pages/Register";
import { ProtectedRoute, PublicRoute } from "../auth/RouteGuards";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    errorElement: <h1>404 Unauthorized</h1>,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "camera",
        element: <Camera />,
      },
      {
        path: "history",
        element: <History />,
      },
    ],
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/register" replace />,
  },
]);




