import { useContext, useEffect, useState } from 'react';
import AuthContext, {
    AuthContextValue,
    UserSession,
} from '../context/auth/auth-context';

type UseSessionParams = {
    waitingTime?: number;
};

export const useSession = ({ waitingTime }: UseSessionParams = {}) => {
    const { authenticateUser, getTranscendanceApi, session, logout, login } =
        useContext(AuthContext) as AuthContextValue;
    const [currentSession, setCurrentSession] = useState<UserSession>(session);

    useEffect(() => {
        if (session.state === 'loading') {
            setTimeout(() => authenticateUser(), waitingTime || 0);
        }
        setCurrentSession(session);
    }, [session.state, session.user]);

    return {
        ...currentSession,
        transcendanceApi: getTranscendanceApi(),
        logout,
        login,
        reloadUser: authenticateUser,
    };
};
