import { createContext } from 'react';
import { AxiosInstance } from 'axios';

export const LOCAL_STORAGE_TOKEN_KEY = 'transcendance_access_token';

export type AuthContextValue = {
    getTranscendanceApi: () => AxiosInstance;
    authenticateUser: () => Promise<null | User>;
    session: UserSession;
    logout: () => void;
    login: (email: string, password: string) => Promise<boolean>;
};

type LoginAction = 'login' | 'logout' | 'none';

export type UserSession = {
    user: User | null;
    state: AuthState;
    lastLoginAction: LoginAction;
};

/* TODO: replace user by proper type to enforce type safety */
export type User = any;

export type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

const AuthContext = createContext<null | AuthContextValue>(null);

export default AuthContext;
