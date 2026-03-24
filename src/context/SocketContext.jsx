import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();

  // Store socket in state so consumers re-render when it becomes available
  const [socket, setSocket]       = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      // Not logged in — disconnect any existing socket
      setSocket((prev) => {
        prev?.disconnect();
        return null;
      });
      setConnected(false);
      return;
    }

    const s = io("http://localhost:8000", {
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    s.on("connect",    () => { setConnected(true);  console.log("Socket connected:", s.id); });
    s.on("disconnect", () => { setConnected(false); console.log("Socket disconnected"); });
    s.on("connect_error", (err) => console.error("Socket error:", err.message));

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);