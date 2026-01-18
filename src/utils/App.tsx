import { RouterProvider } from "react-router-dom";
import { router } from "../routes";
import { AuthProvider } from "../contexts/AuthProvider";
import { LiveProvider } from "../contexts/LiveProvider";

function App() {

  return (
    <AuthProvider>
      <LiveProvider>
        <RouterProvider router={router} />
      </LiveProvider>
    </AuthProvider>
  );
}

export default App;
