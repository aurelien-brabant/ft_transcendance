import { createContext } from 'react';

export type LoginMethod = '42' | 'credentials';
export type LoginPayload =
    | {
          email: string;
          password: string;
      }
    | {
          apiCode: string;
      };

export type AuthContextValue = {
    authenticateUser: () => Promise<null | User>;
    session: UserSession;
    logout: () => Promise<void>;
    login: (method: LoginMethod, payload: LoginPayload) => Promise<boolean>;
    loginWithTfa: (userId: string, tfaCode: string) => Promise<User | null>;
    isChatOpened: boolean;
    setIsChatOpened: (chatIsOpen: boolean) => void;
    verify: () => Promise<boolean>
    backend: {
        request: (path: string, init?: RequestInit) => Promise<Response>
    }
};

type LoginAction = 'tfa_required' | 'login' | 'logout' | 'none';

export type UserSession = {
    user: User | null;
    state: AuthState;
    lastLoginAction: {
        action: LoginAction;
        queryString?: string;
    };
};

/* TODO: replace user by proper type to enforce type safety */
export type User = any;

export type AuthState =
    | 'loading'
    | 'tfa_required'
    | 'authenticated'
    | 'unauthenticated';

const AuthContext = createContext<null | AuthContextValue>(null);

export default AuthContext;
