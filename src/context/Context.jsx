import { createContext, use, useEffect, useState } from "react";
export const AppContext = createContext();
import axios from 'axios'
import { useNavigate, useLocation } from "react-router-dom";

const ContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const navigate = useNavigate()
    const location = useLocation()
    
    const [token, setToken] = useState('')
    const [role , setRole]= useState(false)
 
    const value = {
        backendUrl, 
        token, 
        setToken, 
        role,
        setRole
    }
    
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default ContextProvider;