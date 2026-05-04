import AppRoutes from "./app/appRoutes.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <SocketProvider>
      <AppRoutes />

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </SocketProvider>
  );
}

export default App;