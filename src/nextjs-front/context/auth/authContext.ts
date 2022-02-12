import { createContext } from 'react';
import {LoggedUser} from 'transcendance-types';

export type AuthContextType = {
	fetchAsLoggedUser: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;
	getUserData: () => LoggedUser;
	authenticateUser: () => Promise<boolean>;
	logout: () => void;
	isAuthenticated: boolean;
	clearUser: () => void
	mergeUserData: (data: any) => any;
}

const authContext = createContext<AuthContextType | null>(null);

export default authContext;
