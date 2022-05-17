import { useContext, useEffect, useState } from 'react';
import AuthContext, {
    AuthContextValue,
    UserSession,
} from '../context/auth/authContext';

type UseSessionParams = {
    waitingTime?: number;
};

export const useSession = ({ waitingTime }: UseSessionParams = {}) => {
    const {
        loginWithTfa,
        authenticateUser,
        session,
        logout,
        login,
        verify,
        backend
    } = useContext(AuthContext) as AuthContextValue;
    const [currentSession, setCurrentSession] = useState<UserSession>(session);

    useEffect(() => {
        if (session.state === 'loading') {
            setTimeout(() => authenticateUser(), waitingTime || 0);
        }
        setCurrentSession(session);
    }, [session.state, session.user]);

    return {
        ...currentSession,
        logout,
        login,
        reloadUser: authenticateUser,
        loginWithTfa,
        verify,
        backend
    };
};
