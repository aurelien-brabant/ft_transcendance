import AuthContext, {
    LOCAL_STORAGE_TOKEN_KEY,
    User,
    UserSession,
} from './auth-context';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const AuthProvider: React.FC = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [session, setSession] = useState<UserSession>({
        state: 'loading',
        user: null,
        lastLoginAction: 'none',
    });
    const router = useRouter();

    useEffect(() => {
        if (session.lastLoginAction !== 'none') {
            setSession({
                ...session,
                lastLoginAction: 'none',
            });
            router.push(
                session.lastLoginAction === 'login' ? '/welcome' : '/signin'
            );
        }
    }, [session]);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const axiosRes = await axios.post(
                process.env.NEXT_PUBLIC_API_URL + '/auth/login',
                { email, password }
            );
            const { accessToken } = axiosRes.data;

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(
                    LOCAL_STORAGE_TOKEN_KEY,
                    accessToken
                );
            }
            setSession({
                ...session,
                state: 'loading',
                lastLoginAction: 'login',
            });

            return true;
        } catch (error) {}

        return false;
    };

    const getToken = () => {
        if (token) {
            return token;
        }
        if (typeof window === 'undefined') {
            return null;
        }

        const t = window.localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);

        setToken(t);

        return t;
    };

    /**
     * Make requests to the metric API as the currently logged in user
     */
    const getTranscendanceApi = () =>
        axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL,
            headers: {
                ...(getToken()
                    ? { Authorization: `Bearer ${getToken()}` }
                    : {}),
            },
        });

    const logout = (): void => {
        window.localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
        setToken(null);
        setSession({
            state: 'unauthenticated',
            user: null,
            lastLoginAction: 'logout',
        });
    };

    const authenticateUser = async (): Promise<null | User> => {
        let t = getToken();

        if (!t) {
            setSession({
                ...session,
                user: null,
                state: 'unauthenticated',
            });
            return null;
        }

        try {
            const axiosRes = await getTranscendanceApi().get('/auth/login');

            setSession({
                ...session,
                state: 'authenticated',
                user: axiosRes.data,
            });

            return axiosRes.data;
        } catch (error) {
            setSession({
                ...session,
                state: 'unauthenticated',
                user: null,
            });
        }

        return null;
    };

    return (
        <AuthContext.Provider
            value={{
                getTranscendanceApi,
                authenticateUser,
                session,
                logout,
                login,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
