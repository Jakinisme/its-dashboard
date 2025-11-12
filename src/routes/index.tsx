import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Dashboard from "../components/pages/Dashboard/Dashboard";
import History from "../components/pages/History/History";
import Camera from "../components/pages/Camera";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
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
]);




