import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Dashboard from "../components/pages/Dashboard/Dashboard";
import History from "../components/pages/History/History";
import Settings from "../components/pages/Settings/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <h1>404</h1>,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "history",
        element: <History />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);

