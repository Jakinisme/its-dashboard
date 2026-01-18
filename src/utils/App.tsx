import { RouterProvider } from "react-router-dom";
import { router } from "../routes";
import { AuthProvider } from "../contexts/AuthProvider";
import { LiveProvider } from "../contexts/LiveProvider";
import { useTokenRefresh } from "../hooks/useTokenRefresh";

function App() {

  useTokenRefresh();

  return (
    <AuthProvider>
      <LiveProvider>
        <RouterProvider router={router} />
      </LiveProvider>
    </AuthProvider>
  );
}

export default App;
