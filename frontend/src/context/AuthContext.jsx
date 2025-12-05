import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api/backend';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.getMe().then(setUser).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const { access_token } = await api.login({ email, password });
        localStorage.setItem('token', access_token);
        const user = await api.getMe();
        setUser(user);
        return user;
    };

    const register = async (username, email, password) => {
        const { access_token } = await api.register({ username, email, password });
        localStorage.setItem('token', access_token);
        const user = await api.getMe();
        setUser(user);
        return user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
