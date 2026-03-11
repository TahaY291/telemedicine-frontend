import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // null = not logged in
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            try {
                const { data } = await api.post("/users/is-authenticated");
                const currentUser = data?.data?.user || null;
                if (isMounted) {
                    setUser(currentUser);
                }
            } catch {
                if (isMounted) {
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        checkAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);