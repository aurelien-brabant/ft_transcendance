import AuthContext, {
    LoginMethod,
    LoginPayload,
    User,
    UserSession,
} from './authContext';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const lastActionToRoute: { [key: string]: string } = {
    login: '/welcome',
    tfa_required: '/validate-tfa',
    logout: '/signin',
};

const AuthProvider: React.FC = ({ children }) => {
    /* Chat */
    const [isChatOpened, setIsChatOpened] = useState(false);

    /* Session */
    const [session, setSession] = useState<UserSession>({
        state: 'loading',
        user: null,
        lastLoginAction: {
            action: 'none',
        },
    });
    const router = useRouter();

    useEffect(() => {
        const {
            lastLoginAction: { action, queryString },
        } = session;
        if (action !== 'none') {
            setSession({
                ...session,
                lastLoginAction: {
                    action: 'none',
                },
            });
            router.push(`${lastActionToRoute[action]}${queryString || ''}`);
        }
    }, [session]);

    const login = async (
        method: LoginMethod,
        payload: LoginPayload
    ): Promise<boolean> => {
        const res = await fetch(
            `/api/auth/${
                method === '42' ? 'login42' : 'login'
            }`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify(payload),
            }
        );

        if (res.status !== 201) {
            const { error, userId } = await res.json();

            if (error === 'TFA_REQUIRED') {
                setSession({
                    ...session,
                    lastLoginAction: {
                        action: 'tfa_required',
                        queryString: `?userId=${userId}`,
                    },
                });

                return true;
            }

            return false;
        }

        setSession({
            ...session,
            state: 'loading',
            lastLoginAction: { action: 'login' },
        });

        return true;
    };

    const loginWithTfa = async (
        userId: string,
        tfaCode: string
    ): Promise<User | null> => {
        const validateTfaRes = await fetch(
            `/api/users/${userId}/validate-tfa`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: tfaCode }),
            }
        );

        if (validateTfaRes.status !== 200) {
            return null;
        }

        const loginTfaRes = await fetch('/api/auth/login-tfa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });

        if (loginTfaRes.status !== 201) {
            return null;
        }

        const user = await loginTfaRes.json();

        setSession({
            ...session,
            state: 'loading',
            lastLoginAction: {
                action: 'login',
            },
        });

        return user;
    };

    /**
     * Call this each time a logged in user needs to access API resources
     */

    const requestBackend = async (path: string, init?: RequestInit) => {
        const res = await fetch(path, init);

        /* user token has probably expired, so we need to force them to log out */
        if (res.status === 401) {
            await logout();
            /* wait for the session lastAction to update and redirect automatically. Do not let the call end until then */
            await new Promise(() => {})
        }

        return res;
    }

    const logout = async (): Promise<void> => {
        const res = await fetch('/api/auth/log-out');

        setSession({
            state: 'unauthenticated',
            user: null,
            lastLoginAction: {
                action: 'logout',
            },
        });
        setIsChatOpened(false);
    };

    const verify = async (): Promise<boolean> => {
        const res = await fetch('/api/auth/is-logged-in')

        if (!res.ok) {
            setSession({
                lastLoginAction: {
                    action: 'logout',
                },
                state: 'unauthenticated',
                user: null
            })
        }

        return res.ok;
    }

    const authenticateUser = async (): Promise<null | User> => {
        const res = await fetch('/api/auth/login');

        if (res.status !== 200) {
            setSession({
                ...session,
                state: 'unauthenticated',
                user: null,
            });

            return null;
        }

        const user = await res.json();

        setSession({
            ...session,
            state: 'authenticated',
            user,
        });

        return user;
    };

    return (
        <AuthContext.Provider
            value={{
                authenticateUser,
                session,
                loginWithTfa,
                logout,
                login,
                isChatOpened,
                setIsChatOpened,
                verify,
                backend: {
                    request: requestBackend
                }
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
