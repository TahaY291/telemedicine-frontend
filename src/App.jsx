import AppRoutes from "./app/appRoutes.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";

function App() {
  return  <SocketProvider>   
      <AppRoutes />
    </SocketProvider>
}

export default App;